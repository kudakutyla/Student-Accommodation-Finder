import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { postMessageSchema } from '../validators/enquiry.validator';
import { getConversations, getMessages, postConversationMessage } from '../controllers/conversation.controller';

const router = Router();

router.get('/', requireAuth, requireRole('STUDENT', 'LANDLORD'), getConversations);
router.get('/:id/messages', requireAuth, requireRole('STUDENT', 'LANDLORD'), getMessages);
router.post(
  '/:id/messages',
  requireAuth,
  requireRole('STUDENT', 'LANDLORD'),
  validate(postMessageSchema),
  postConversationMessage
);

export default router;
