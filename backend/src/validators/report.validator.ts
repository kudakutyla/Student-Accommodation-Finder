import { z } from 'zod';

export const createReportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum([
    'SUSPICIOUS_FRAUDULENT',
    'INCORRECT_INFORMATION',
    'INAPPROPRIATE_CONTENT',
    'ALREADY_OCCUPIED',
    'DUPLICATE_LISTING',
    'OTHER',
  ]),
  description: z.string().max(2000).optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED', 'INVESTIGATING']),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
