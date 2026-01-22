/**
 * Auth Routes
 * /api/auth
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * Public routes
 */
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * Protected routes (require authentication)
 */
router.use(authenticate); // Apply to all routes below

router.get('/me', AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);
router.patch('/profile', validate(updateProfileSchema), AuthController.updateProfile);
router.post('/change-password', validate(changePasswordSchema), AuthController.changePassword);

export default router;
