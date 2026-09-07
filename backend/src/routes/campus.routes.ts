import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCampusSchema, updateCampusSchema } from '../validators/campus.validator';
import { getCampuses, getCampus, postCampus, putCampus } from '../controllers/campus.controller';

const router = Router();

router.get('/', optionalAuth, getCampuses);
router.get('/:id', getCampus);
router.post('/', requireAuth, requireRole('ADMIN'), validate(createCampusSchema), postCampus);
router.put('/:id', requireAuth, requireRole('ADMIN'), validate(updateCampusSchema), putCampus);

export default router;
