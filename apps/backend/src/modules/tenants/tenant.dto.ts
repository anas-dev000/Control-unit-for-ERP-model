import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  settings: z.any().optional(),
});

export type UpdateTenantDTO = z.infer<typeof updateTenantSchema>;
