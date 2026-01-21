/**
 * Completions Routes
 * /api/completions
 */

import { Router } from 'express';
import { CompletionController } from '../controllers/CompletionController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCompletionSchema,
  getCompletionsQuerySchema,
  calendarParamsSchema,
} from '../validators/completion.validator';

const router = Router();

/**
 * All completion routes require authentication
 */
router.use(authenticate);

router.post('/', validate(createCompletionSchema), CompletionController.create);
router.delete('/:habitId/:date', CompletionController.delete);
router.get('/', validate(getCompletionsQuerySchema, 'query'), CompletionController.getAll);
router.get(
  '/calendar/:year/:month',
  validate(calendarParamsSchema, 'params'),
  CompletionController.getMonthlyCalendar
);

export default router;
