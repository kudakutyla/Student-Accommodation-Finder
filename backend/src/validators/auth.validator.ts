import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

// Public registration only ever allows STUDENT or LANDLORD - ADMIN is never accepted here.
export const registerSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    role: z.enum(['STUDENT', 'LANDLORD']),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phoneNumber: z.string().max(30).optional(),
    campusId: z.string().uuid().optional(),
    businessName: z.string().max(150).optional(),
  })
  .refine((data) => data.role !== 'STUDENT' || !!data.campusId, {
    message: 'campusId is required for students',
    path: ['campusId'],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
