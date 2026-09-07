import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { updateOwnProfile } from '../services/user.service';
import { getCurrentUser } from '../services/auth.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.userId);
  return sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateOwnProfile(req.user!.userId, req.user!.role, req.body);
  return sendSuccess(res, user, 200, undefined, 'Profile updated successfully');
});
