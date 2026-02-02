import { Decimal } from 'decimal.js';
import prisma from '../../lib/prisma';
import { CreateInvoiceDTO } from './invoice.dto';
import { getTenantId, getUserId } from '../../lib/context';
import { UnauthorizedError, NotFoundError, ValidationError } from '../../common/errors/AppError';

export class InvoiceService {
  private static TAX_RATE = 0.15; // 15% tax as per requirement

  static async create(data: CreateInvoiceDTO) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const { items, ...invoiceData } = data;

    // Calculate totals with high precision (requirement 7)
    let subtotal = new Decimal(0);
    const invoiceItems = items.map((item, index) => {
      const amount = new Decimal(item.quantity).times(item.unitPrice);
      subtotal = subtotal.plus(amount);
      return {
        description: item.description,
        quantity: new Decimal(item.quantity),
        unitPrice: new Decimal(item.unitPrice),
        amount,
        sortOrder: index,
      };
    });

    const taxAmount = subtotal.times(this.TAX_RATE).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const total = subtotal.plus(taxAmount).toDecimalPlaces(2);

    return await prisma.$transaction(async (tx) => {
      // Check customer ownership
      const customer = await tx.customer.findFirst({
        where: { id: data.customerId, tenantId, deletedAt: null },
      });
      if (!customer) throw new NotFoundError('Customer');

      // Check for duplicate invoice number
      const existingInvoice = await tx.invoice.findFirst({
        where: { tenantId, invoiceNumber: data.invoiceNumber, deletedAt: null },
      });
      if (existingInvoice) throw new ValidationError('Invoice number already exists');

      return await tx.invoice.create({
        data: {
          ...invoiceData,
          tenantId,
          createdBy: getUserId(),
          subtotal,
          taxRate: this.TAX_RATE,
          taxAmount,
          total,
          status: 'DRAFT',
          items: {
            create: invoiceItems,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });
    });
  }

  static async findAll(page = 1, limit = 20, status?: string, customerId?: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const where = {
      tenantId,
      deletedAt: null,
      ...(status ? { status: status as any } : {}),
      ...(customerId ? { customerId } : {}),
    };

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
    ]);

    return {
      invoices,
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

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        customer: true,
        payments: true,
      },
    });

    if (!invoice) throw new NotFoundError('Invoice');
    return invoice;
  }

  static async updateStatus(id: string, status: any) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    // Verify ownership
    await this.findById(id);

    return await prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  // Soft delete / Cancel
  static async cancel(id: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const invoice = await this.findById(id);
    if (invoice.paidAmount.gt(0)) {
      throw new ValidationError('Cannot cancel an invoice with payments');
    }

    return await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
