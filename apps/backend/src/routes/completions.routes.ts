import { Router } from 'express';
import { CompletionController } from '../controllers/CompletionController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCompletionSchema,
  deleteCompletionParamsSchema,
  getCompletionsQuerySchema,
  getMonthlyCalendarParamsSchema,
} from '../validators/completion.validator';

const router = Router();

// All completion routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/completions
 * @desc    Mark a habit as complete
 * @access  Private
 */
router.post('/', validate(createCompletionSchema), CompletionController.create);

/**
 * @route   GET /api/completions
 * @desc    Get completions with optional filters
 * @access  Private
 */
router.get(
  '/',
  validate(getCompletionsQuerySchema, 'query'),
  CompletionController.getAll
);

/**
 * @route   GET /api/completions/calendar/:year/:month
 * @desc    Get monthly calendar view
 * @access  Private
 */
router.get(
  '/calendar/:year/:month',
  validate(getMonthlyCalendarParamsSchema, 'params'),
  CompletionController.getMonthlyCalendar
);

/**
 * @route   DELETE /api/completions/:habitId/:date
 * @desc    Unmark a habit completion
 * @access  Private
 */
router.delete(
  '/:habitId/:date',
  validate(deleteCompletionParamsSchema, 'params'),
  CompletionController.delete
);

export default router;
