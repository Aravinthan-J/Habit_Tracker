/**
 * Badge Routes
 * /api/badges
 */

import { Router } from 'express';
import { BadgeController } from '../controllers/BadgeController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { checkUnlocksSchema } from '../validators/badge.validator';

const router = Router();

/**
 * All badge routes require authentication
 */
router.use(authenticate);

router.get('/', BadgeController.getAll);
router.get('/user', BadgeController.getUserBadges);
router.get('/progress', BadgeController.getProgress);
router.post('/check', validate(checkUnlocksSchema), BadgeController.checkUnlocks);

export default router;
