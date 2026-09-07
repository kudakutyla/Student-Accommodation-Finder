import { Router } from 'express';
import { register, login, me, logout } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/security.middleware';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

export default router;
