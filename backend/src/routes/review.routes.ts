import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator';
import {
  postReview,
  putReview,
  removeReview,
  getListingReviews,
  getMyReviews,
} from '../controllers/review.controller';

const router = Router();

router.get('/mine', requireAuth, requireRole('STUDENT'), getMyReviews);
router.get('/listing/:listingId', getListingReviews);
router.post('/', requireAuth, requireRole('STUDENT'), validate(createReviewSchema), postReview);
router.put('/:id', requireAuth, requireRole('STUDENT'), validate(updateReviewSchema), putReview);
router.delete('/:id', requireAuth, requireRole('STUDENT', 'ADMIN'), removeReview);

export default router;
