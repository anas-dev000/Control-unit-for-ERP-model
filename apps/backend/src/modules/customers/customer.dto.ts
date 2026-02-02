import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  creditLimit: z.number().min(0).default(0),
  paymentTerms: z.number().int().min(0).default(30),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
