import { z } from 'zod';

export const recordPaymentSchema = z.object({
  customerId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentDate: z.string().datetime().or(z.date()).optional(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RecordPaymentDTO = z.infer<typeof recordPaymentSchema>;
