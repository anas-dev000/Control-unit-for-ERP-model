import prisma from '../../lib/prisma';
import { getTenantId } from '../../lib/context';
import { UnauthorizedError } from '../../common/errors/AppError';

export class DashboardService {
  static async getSummary() {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const [revenue, outstanding, invoiceStats, topCustomers] = await Promise.all([
      // Total revenue (paid amount on all invoices)
      prisma.invoice.aggregate({
        where: { tenantId, deletedAt: null },
        _sum: { paidAmount: true }
      }),
      
      // Total outstanding (total - paidAmount)
      // Note: Prisma doesn't support sum of subtraction in aggregate easily
      // We'll calculate it from totals
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
      
      // Top 5 customers by revenue
      prisma.customer.findMany({
        where: { tenantId, deletedAt: null },
        select: {
          id: true,
          name: true,
          _count: { select: { invoices: true } },
          invoices: {
            where: { status: 'PAID', deletedAt: null },
            select: { total: true }
          }
        },
        take: 5
      })
    ]);

    const totalRevenue = Number(revenue._sum.paidAmount || 0);
    const totalOutstanding = Number(outstanding._sum.total || 0) - Number(outstanding._sum.paidAmount || 0);

    return {
      totalRevenue,
      totalOutstanding,
      invoiceStats,
      topCustomers: topCustomers.map(c => ({
        id: c.id,
        name: c.name,
        revenue: c.invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
      })).sort((a, b) => b.revenue - a.revenue)
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
