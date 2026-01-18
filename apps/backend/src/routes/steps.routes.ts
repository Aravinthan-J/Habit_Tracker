import { Router } from 'express';
import { StepController } from '../controllers/StepController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  logStepsSchema,
  getStepsQuerySchema,
  getMonthlyStepsQuerySchema,
  dateParamSchema,
  updateStepsSchema,
} from '../validators/step.validator';

const router = Router();

// All step routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/steps
 * @desc    Log step data
 * @access  Private
 */
router.post('/', validate(logStepsSchema), StepController.logSteps);

/**
 * @route   GET /api/steps
 * @desc    Get step data for date range
 * @access  Private
 */
router.get(
  '/',
  validate(getStepsQuerySchema, 'query'),
  StepController.getSteps
);

/**
 * @route   GET /api/steps/today
 * @desc    Get today's step data
 * @access  Private
 */
router.get('/today', StepController.getTodaySteps);

/**
 * @route   GET /api/steps/stats
 * @desc    Get step statistics
 * @access  Private
 */
router.get('/stats', StepController.getStats);

/**
 * @route   GET /api/steps/weekly
 * @desc    Get weekly step data (last 7 days)
 * @access  Private
 */
router.get('/weekly', StepController.getWeeklySteps);

/**
 * @route   GET /api/steps/monthly
 * @desc    Get monthly step summary
 * @access  Private
 */
router.get(
  '/monthly',
  validate(getMonthlyStepsQuerySchema, 'query'),
  StepController.getMonthlySteps
);

/**
 * @route   PATCH /api/steps/:date
 * @desc    Update step data for a specific date
 * @access  Private
 */
router.patch(
  '/:date',
  validate(dateParamSchema, 'params'),
  validate(updateStepsSchema),
  StepController.updateSteps
);

/**
 * @route   DELETE /api/steps/:date
 * @desc    Delete step data for a specific date
 * @access  Private
 */
router.delete(
  '/:date',
  validate(dateParamSchema, 'params'),
  StepController.deleteSteps
);

export default router;
