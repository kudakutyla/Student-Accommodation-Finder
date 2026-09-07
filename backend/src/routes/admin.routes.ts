import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { verifyLandlordSchema, suspendUserSchema } from '../validators/admin.validator';
import { rejectListingSchema } from '../validators/listing.validator';
import {
  getDashboard,
  getUsers,
  getLandlords,
  getPendingLandlords,
  patchVerifyLandlord,
  patchSuspendUser,
  getAdminListings,
  postApproveListing,
  postRejectListing,
  getAuditLogs,
} from '../controllers/admin.controller';
import { getReports, patchReport } from '../controllers/report.controller';
import { getAllReviewsAdmin, removeReview } from '../controllers/review.controller';

const router = Router();

// Every route in this file requires an authenticated ADMIN - enforced at the backend, not just the UI.
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.patch('/users/:id/suspend', validate(suspendUserSchema), patchSuspendUser);

router.get('/landlords', getLandlords);
router.get('/landlords/pending', getPendingLandlords);
router.patch('/landlords/:id/verify', validate(verifyLandlordSchema), patchVerifyLandlord);

router.get('/listings', getAdminListings);
router.patch('/listings/:id/approve', postApproveListing);
router.patch('/listings/:id/reject', validate(rejectListingSchema), postRejectListing);

router.get('/reports', getReports);
router.patch('/reports/:id', patchReport);

router.get('/reviews', getAllReviewsAdmin);
router.delete('/reviews/:id', removeReview);

router.get('/audit-logs', getAuditLogs);

export default router;
