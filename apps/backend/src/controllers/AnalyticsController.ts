import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

/**
 * Controller for analytics endpoints
 */
export class AnalyticsController {
  /**
   * Get overview statistics
   * GET /api/analytics/overview
   */
  static getOverview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const overview = await AnalyticsService.getOverview(userId);

    sendSuccess(res, { overview }, 'Overview statistics retrieved successfully');
  });

  /**
   * Get analytics for a specific habit
   * GET /api/analytics/habits/:id
   */
  static getHabitAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const analytics = await AnalyticsService.getHabitAnalytics(id, userId);

    sendSuccess(res, { analytics }, 'Habit analytics retrieved successfully');
  });

  /**
   * Get trend data over time
   * GET /api/analytics/trends?period=week|month|3months|year
   */
  static getTrends = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const validPeriods = ['week', 'month', '3months', 'year'];
    const normalizedPeriod = validPeriods.includes(period) ? period : 'month';

    const trends = await AnalyticsService.getTrends(
      userId,
      normalizedPeriod as 'week' | 'month' | '3months' | 'year'
    );

    sendSuccess(res, { trends, period: normalizedPeriod }, 'Trends retrieved successfully');
  });

  /**
   * Get generated insights
   * GET /api/analytics/insights
   */
  static getInsights = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const insights = await AnalyticsService.generateInsights(userId);

    sendSuccess(
      res,
      { insights, count: insights.length },
      'Insights generated successfully'
    );
  });

  /**
   * Get step vs habits correlation
   * GET /api/analytics/correlation
   */
  static getCorrelation = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const correlation = await AnalyticsService.calculateStepCorrelation(userId);

    sendSuccess(res, { correlation }, 'Correlation data retrieved successfully');
  });

  /**
   * Get heatmap data for the year
   * GET /api/analytics/heatmap?year=YYYY
   */
  static getHeatmap = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;

    const heatmap = await AnalyticsService.getHeatmapData(userId, year);

    sendSuccess(
      res,
      { heatmap, year: year || new Date().getFullYear() },
      'Heatmap data retrieved successfully'
    );
  });

  /**
   * Get top performing habits
   * GET /api/analytics/top-habits?limit=5
   */
  static getTopHabits = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = req.query.limit
      ? Math.min(parseInt(req.query.limit as string, 10), 10)
      : 5;

    const topHabits = await AnalyticsService.getTopHabits(userId, limit);

    sendSuccess(
      res,
      { habits: topHabits, count: topHabits.length },
      'Top habits retrieved successfully'
    );
  });
}
