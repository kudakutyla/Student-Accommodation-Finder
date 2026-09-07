import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createListingSchema,
  updateListingSchema,
  updateAvailabilitySchema,
  searchListingsSchema,
} from '../validators/listing.validator';
import {
  postListing,
  putListing,
  patchAvailability,
  removeListing,
  getListing,
  getMyListings,
  getListings,
} from '../controllers/listing.controller';

const router = Router();

router.get('/', validate(searchListingsSchema, 'query'), getListings);
router.get('/mine', requireAuth, requireRole('LANDLORD'), getMyListings);
router.get('/:id', optionalAuth, getListing);

router.post('/', requireAuth, requireRole('LANDLORD'), validate(createListingSchema), postListing);
router.put('/:id', requireAuth, requireRole('LANDLORD'), validate(updateListingSchema), putListing);
router.patch(
  '/:id/availability',
  requireAuth,
  requireRole('LANDLORD'),
  validate(updateAvailabilitySchema),
  patchAvailability
);
router.delete('/:id', requireAuth, requireRole('LANDLORD', 'ADMIN'), removeListing);

export default router;
