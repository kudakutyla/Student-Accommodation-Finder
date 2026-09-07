import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createEnquirySchema } from '../validators/enquiry.validator';
import { postEnquiry, getEnquiries, getEnquiry } from '../controllers/enquiry.controller';

const router = Router();

router.get('/', requireAuth, requireRole('STUDENT', 'LANDLORD'), getEnquiries);
router.get('/:id', requireAuth, requireRole('STUDENT', 'LANDLORD'), getEnquiry);
router.post('/', requireAuth, requireRole('STUDENT'), validate(createEnquirySchema), postEnquiry);

export default router;
