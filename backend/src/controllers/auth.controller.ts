import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { registerUser, loginUser, getCurrentUser } from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await registerUser(req.body);
  return sendSuccess(res, { user, token }, 201, undefined, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await loginUser(req.body);
  return sendSuccess(res, { user, token }, 200, undefined, 'Login successful');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.userId);
  return sendSuccess(res, user);
});

// Stateless JWT - logout is handled client-side by discarding the token.
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, null, 200, undefined, 'Logged out successfully');
});
