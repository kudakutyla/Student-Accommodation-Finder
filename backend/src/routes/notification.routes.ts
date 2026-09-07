import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getNotifications,
  patchNotificationRead,
  patchAllNotificationsRead,
} from '../controllers/notification.controller';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.patch('/read-all', requireAuth, patchAllNotificationsRead);
router.patch('/:id/read', requireAuth, patchNotificationRead);

export default router;
