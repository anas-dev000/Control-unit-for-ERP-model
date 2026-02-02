import prisma from '../../lib/prisma';
import { RecordPaymentDTO } from './payment.dto';
import { getTenantId, getUserId } from '../../lib/context';
import { UnauthorizedError, NotFoundError } from '../../common/errors/AppError';
import { Decimal } from 'decimal.js';

export class PaymentService {
  static async record(data: RecordPaymentDTO) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    return await prisma.$transaction(async (tx) => {
      // 1. Verify customer
      const customer = await tx.customer.findFirst({
        where: { id: data.customerId, tenantId, deletedAt: null },
      });
      if (!customer) throw new NotFoundError('Customer');

      // 2. If invoiceId provided, verify and update invoice
      if (data.invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: { id: data.invoiceId, tenantId, deletedAt: null },
        });
        if (!invoice) throw new NotFoundError('Invoice');

        const newPaidAmount = Decimal.add(invoice.paidAmount, data.amount);
        
        // Update status based on paid amount
        let status = invoice.status;
        if (newPaidAmount.gte(invoice.total)) {
          status = 'PAID';
        } else if (newPaidAmount.gt(0)) {
          status = 'PARTIAL';
        }

        await tx.invoice.update({
          where: { id: data.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: status as any,
          },
        });
      }

      // 3. Create payment record
      return await tx.payment.create({
        data: {
          ...data,
          tenantId,
          createdBy: getUserId(),
          amount: new Decimal(data.amount),
        },
      });
    });
  }

  static async findAll(page = 1, limit = 20, customerId?: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new UnauthorizedError();

    const where = {
      tenantId,
      deletedAt: null,
      ...(customerId ? { customerId } : {}),
    };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: { 
          customer: { select: { name: true } },
          invoice: { select: { invoiceNumber: true } }
        },
      }),
    ]);

    return {
      payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
