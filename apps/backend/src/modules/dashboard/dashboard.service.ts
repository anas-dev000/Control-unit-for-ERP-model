import prisma from '../../lib/prisma';
import { getTenantId } from '../../lib/context';
import { UnauthorizedError } from '../../common/errors/AppError';

export class DashboardService {
  static async getSummary() {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const [revenue, outstanding, invoiceStats, topCustomerStats, totalCustomers, activeInvoices, last30DaysInvoices] = await Promise.all([
      // Total revenue (paid amount on all invoices)
      prisma.invoice.aggregate({
        where: { tenantId, deletedAt: null },
        _sum: { paidAmount: true }
      }),
      
      // Total outstanding (total - paidAmount)
      prisma.invoice.aggregate({
        where: { 
          tenantId, 
          status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
          deletedAt: null 
        },
        _sum: { total: true, paidAmount: true }
      }),
      
      // Invoice counts by status
      prisma.invoice.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null },
        _count: { _all: true }
      }),
      
      // Top 5 customers by revenue (Aggregation Step 1)
      prisma.invoice.groupBy({
        by: ['customerId'],
        where: { 
            tenantId, 
            deletedAt: null,
            status: { in: ['PAID', 'PARTIAL'] }
        },
        _sum: { paidAmount: true },
        orderBy: {
            _sum: { paidAmount: 'desc' }
        },
        take: 5
      }),

      // Total Customers
      prisma.customer.count({
        where: { tenantId, deletedAt: null }
      }),

      // Active Invoices (Not Paid or Cancelled)
      prisma.invoice.count({
        where: { 
            tenantId, 
            status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
            deletedAt: null
        }
      }),

      // Revenue Chart Data (Last 30 Days)
      prisma.payment.groupBy({
        by: ['paymentDate'],
        where: {
            tenantId,
            deletedAt: null,
            paymentDate: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
        },
        _sum: { amount: true }
      })
    ]);

    const totalRevenue = Number(revenue._sum.paidAmount || 0);
    const totalOutstanding = Number(outstanding._sum.total || 0) - Number(outstanding._sum.paidAmount || 0);

    // Fetch details for top customers (Aggregation Step 2)
    const topCustomerDetails = await prisma.customer.findMany({
        where: {
            id: { in: topCustomerStats.map(s => s.customerId) },
            tenantId
        },
        select: { id: true, name: true }
    });

    // Map stats to details
    const topCustomers = topCustomerStats.map(stat => {
        const detail = topCustomerDetails.find(c => c.id === stat.customerId);
        return {
            id: stat.customerId,
            name: detail?.name || 'Unknown',
            revenue: Number(stat._sum.paidAmount || 0)
        };
    });

    // Process Chart Data
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Find payments for this day
        // Note: GroupBy returns Date objects, need to match YYYY-MM-DD
        const dayTotal = last30DaysInvoices
            .filter(p => p.paymentDate.toISOString().split('T')[0] === dateStr)
            .reduce((sum, p) => sum + Number(p._sum.amount || 0), 0);

        chartData.push({ name: dayName, date: dateStr, rev: dayTotal });
    }

    return {
      totalRevenue,
      totalOutstanding,
      totalCustomers,
      activeInvoices,
      invoiceStats,
      revenueChart: chartData,
      topCustomers
    };
  }

  static async getAgingReport() {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();
    
    const now = new Date();
    const invoices = await prisma.invoice.findMany({
      where: { 
        tenantId, 
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        deletedAt: null 
      },
      select: { total: true, paidAmount: true, dueDate: true }
    });

    const aging: Record<string, number> = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

    invoices.forEach(inv => {
      const outstanding = Number(inv.total) - Number(inv.paidAmount);
      const diffDays = Math.ceil((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) aging.current += outstanding;
      else if (diffDays <= 30) aging['1-30'] += outstanding;
      else if (diffDays <= 60) aging['31-60'] += outstanding;
      else if (diffDays <= 90) aging['61-90'] += outstanding;
      else aging['90+'] += outstanding;
    });

    return aging;
  }
}
