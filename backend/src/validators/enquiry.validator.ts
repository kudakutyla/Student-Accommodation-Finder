import { z } from 'zod';

export const createEnquirySchema = z.object({
  listingId: z.string().uuid(),
  message: z.string().min(3).max(2000),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

export const postMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type PostMessageInput = z.infer<typeof postMessageSchema>;
