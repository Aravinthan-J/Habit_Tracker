import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  habitIdParamsSchema,
  trendsQuerySchema,
  heatmapQuerySchema,
  topHabitsQuerySchema,
} from '../validators/analytics.validator';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview statistics
 * @access  Private
 */
router.get('/overview', AnalyticsController.getOverview);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get trend data over time
 * @access  Private
 */
router.get(
  '/trends',
  validate(trendsQuerySchema, 'query'),
  AnalyticsController.getTrends
);

/**
 * @route   GET /api/analytics/insights
 * @desc    Get generated insights
 * @access  Private
 */
router.get('/insights', AnalyticsController.getInsights);

/**
 * @route   GET /api/analytics/correlation
 * @desc    Get step vs habits correlation
 * @access  Private
 */
router.get('/correlation', AnalyticsController.getCorrelation);

/**
 * @route   GET /api/analytics/heatmap
 * @desc    Get heatmap data for the year
 * @access  Private
 */
router.get(
  '/heatmap',
  validate(heatmapQuerySchema, 'query'),
  AnalyticsController.getHeatmap
);

/**
 * @route   GET /api/analytics/top-habits
 * @desc    Get top performing habits
 * @access  Private
 */
router.get(
  '/top-habits',
  validate(topHabitsQuerySchema, 'query'),
  AnalyticsController.getTopHabits
);

/**
 * @route   GET /api/analytics/habits/:id
 * @desc    Get analytics for a specific habit
 * @access  Private
 */
router.get(
  '/habits/:id',
  validate(habitIdParamsSchema, 'params'),
  AnalyticsController.getHabitAnalytics
);

export default router;
