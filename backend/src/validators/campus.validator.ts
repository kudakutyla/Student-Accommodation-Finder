import { z } from 'zod';

export const createCampusSchema = z.object({
  name: z.string().min(1).max(150),
  institution: z.string().min(1).max(150),
  address: z.string().min(1).max(300),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isActive: z.boolean().optional(),
});

export const updateCampusSchema = createCampusSchema.partial();

export type CreateCampusInput = z.infer<typeof createCampusSchema>;
export type UpdateCampusInput = z.infer<typeof updateCampusSchema>;
