/**
 * Habits Routes
 * /api/habits
 */

import { Router } from 'express';
import { HabitController } from '../controllers/HabitController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createHabitSchema,
  updateHabitSchema,
  getHabitsQuerySchema,
} from '../validators/habit.validator';

const router = Router();

/**
 * All habit routes require authentication
 */
router.use(authenticate);

router.post('/', validate(createHabitSchema), HabitController.create);
router.get('/', validate(getHabitsQuerySchema, 'query'), HabitController.getAll);
router.get('/:id', HabitController.getById);
router.patch('/:id', validate(updateHabitSchema), HabitController.update);
router.delete('/:id', HabitController.delete);
router.get('/:id/stats', HabitController.getStats);

export default router;
