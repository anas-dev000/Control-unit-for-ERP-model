import prisma from '../../lib/prisma';
import { CreateCustomerDTO, UpdateCustomerDTO } from './customer.dto';
import { getTenantId, getUserId } from '../../lib/context';
import { UnauthorizedError, NotFoundError } from '../../common/errors/AppError';

export class CustomerService {
  static async create(data: CreateCustomerDTO) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    return await prisma.customer.create({
      data: {
        ...data,
        tenantId,
        createdBy: getUserId(),
      },
    });
  }

  static async findAll(page = 1, limit = 20, search?: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const where = {
      tenantId,
      deletedAt: null,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!customer) throw new NotFoundError('Customer');
    return customer;
  }

  static async update(id: string, data: UpdateCustomerDTO) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    // Verify ownership
    await this.findById(id);

    return await prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    // Verify ownership
    await this.findById(id);

    return await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async getStatement(id: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        invoices: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          include: { payments: true }
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!customer) throw new NotFoundError('Customer');

    // Combine invoices and payments into a ledger
    const ledger = [
      ...customer.invoices.map(inv => ({
        type: 'INVOICE',
        id: inv.id,
        date: inv.date,
        reference: inv.invoiceNumber,
        amount: Number(inv.total),
        balance_effect: Number(inv.total)
      })),
      ...customer.payments.map(pmt => ({
        type: 'PAYMENT',
        id: pmt.id,
        date: pmt.paymentDate,
        reference: pmt.reference || 'Payment',
        amount: Number(pmt.amount),
        balance_effect: -Number(pmt.amount)
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalInvoiced = customer.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = customer.payments.reduce((sum, pmt) => sum + Number(pmt.amount), 0);

    return {
      customer: { id: customer.id, name: customer.name, email: customer.email },
      summary: {
        totalInvoiced,
        totalPaid,
        balance: totalInvoiced - totalPaid
      },
      ledger
    };
  }
}
