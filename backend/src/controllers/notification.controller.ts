import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notification.service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await listNotifications(req.user!.userId);
  return sendSuccess(res, notifications);
});

export const patchNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await markNotificationRead(req.user!.userId, req.params.id);
  return sendSuccess(res, notification);
});

export const patchAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await markAllNotificationsRead(req.user!.userId);
  return sendSuccess(res, null, 200, undefined, 'All notifications marked as read');
});
