import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/ratelimit.middleware';

const router = Router();
const controller = new AuthController();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', authRateLimiter, validateBody(registerSchema), controller.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), controller.login);
router.get('/me', authenticate, controller.getMe as any);

export default router;

