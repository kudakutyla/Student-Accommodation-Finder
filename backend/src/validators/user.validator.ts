import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().max(30).optional(),
  profileImageUrl: z.string().url().max(500).optional().or(z.literal('')),
  campusId: z.string().uuid().optional(),
  businessName: z.string().max(150).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
