import { z } from 'zod';

export const verifyLandlordSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING']),
  reason: z.string().max(500).optional(),
});

export const suspendUserSchema = z.object({
  isSuspended: z.boolean(),
});

export type VerifyLandlordInput = z.infer<typeof verifyLandlordSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
