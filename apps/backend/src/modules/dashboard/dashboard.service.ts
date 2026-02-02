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

    const totalRevenue = revenue._sum.paidAmount || 0;
    const totalOutstanding = (outstanding._sum.total || 0) as any - (outstanding._sum.paidAmount || 0) as any;

    return {
      totalRevenue,
      totalOutstanding,
      invoiceStats,
      topCustomers: topCustomers.map(c => ({
        id: c.id,
        name: c.name,
        revenue: c.invoices.reduce((sum, inv) => sum + (inv.total as any), 0)
      })).sort((a, b) => b.revenue - a.revenue)
    };
  }
}
