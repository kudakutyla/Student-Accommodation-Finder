import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema, resolveReportSchema } from '../validators/report.validator';
import { postReport, getReports, patchReport } from '../controllers/report.controller';

const router = Router();

router.post('/', requireAuth, requireRole('STUDENT'), validate(createReportSchema), postReport);
router.get('/', requireAuth, requireRole('ADMIN'), getReports);
router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(resolveReportSchema), patchReport);

export default router;
