import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { postFavourite, deleteFavourite, getFavourites } from '../controllers/favourite.controller';

const router = Router();

router.get('/', requireAuth, requireRole('STUDENT'), getFavourites);
router.post('/:listingId', requireAuth, requireRole('STUDENT'), postFavourite);
router.delete('/:listingId', requireAuth, requireRole('STUDENT'), deleteFavourite);

export default router;
