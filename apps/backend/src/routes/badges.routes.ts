import { Router } from 'express';
import { BadgeController } from '../controllers/BadgeController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  getBadgeParamsSchema,
  checkBadgesSchema,
} from '../validators/badge.validator';

const router = Router();

/**
 * @route   GET /api/badges
 * @desc    Get all available badges
 * @access  Public
 */
router.get('/', BadgeController.getAll);

/**
 * @route   POST /api/badges/seed
 * @desc    Seed default badges (admin)
 * @access  Public (should be protected in production)
 */
router.post('/seed', BadgeController.seedBadges);

// Protected routes below
router.use(authenticate);

/**
 * @route   GET /api/badges/user
 * @desc    Get user's earned badges
 * @access  Private
 */
router.get('/user', BadgeController.getUserBadges);

/**
 * @route   GET /api/badges/progress
 * @desc    Get progress toward all badges
 * @access  Private
 */
router.get('/progress', BadgeController.getProgress);

/**
 * @route   POST /api/badges/check
 * @desc    Check and unlock badges for user
 * @access  Private
 */
router.post(
  '/check',
  validate(checkBadgesSchema),
  BadgeController.checkAndUnlock
);

/**
 * @route   GET /api/badges/:id
 * @desc    Get a single badge by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getBadgeParamsSchema, 'params'),
  BadgeController.getById
);

export default router;
