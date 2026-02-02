import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string().datetime().or(z.date()).optional(),
  dueDate: z.string().datetime().or(z.date()),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional().nullable(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']),
});

export type CreateInvoiceDTO = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceStatusDTO = z.infer<typeof updateInvoiceStatusSchema>;
