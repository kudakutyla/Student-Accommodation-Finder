import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import campusRoutes from './campus.routes';
import listingRoutes from './listing.routes';
import favouriteRoutes from './favourite.routes';
import enquiryRoutes from './enquiry.routes';
import conversationRoutes from './conversation.routes';
import reviewRoutes from './review.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/campuses', campusRoutes);
router.use('/listings', listingRoutes);
router.use('/favourites', favouriteRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/conversations', conversationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
