import { Router } from 'express';
import { HabitController } from '../controllers/HabitController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createHabitSchema,
  updateHabitSchema,
  getHabitParamsSchema,
  getHabitsQuerySchema,
} from '../validators/habit.validator';

const router = Router();

// All habit routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/habits
 * @desc    Create a new habit
 * @access  Private
 */
router.post('/', validate(createHabitSchema), HabitController.create);

/**
 * @route   GET /api/habits
 * @desc    Get all habits for authenticated user
 * @access  Private
 */
router.get(
  '/',
  validate(getHabitsQuerySchema, 'query'),
  HabitController.getAll
);

/**
 * @route   GET /api/habits/:id
 * @desc    Get a single habit by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getHabitParamsSchema, 'params'),
  HabitController.getById
);

/**
 * @route   PATCH /api/habits/:id
 * @desc    Update a habit
 * @access  Private
 */
router.patch(
  '/:id',
  validate(getHabitParamsSchema, 'params'),
  validate(updateHabitSchema),
  HabitController.update
);

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete (archive) a habit
 * @access  Private
 */
router.delete(
  '/:id',
  validate(getHabitParamsSchema, 'params'),
  HabitController.delete
);

/**
 * @route   GET /api/habits/:id/stats
 * @desc    Get habit statistics
 * @access  Private
 */
router.get(
  '/:id/stats',
  validate(getHabitParamsSchema, 'params'),
  HabitController.getStats
);

export default router;
