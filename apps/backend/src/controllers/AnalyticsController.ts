/**
 * Analytics Controller
 * Handles analytics-related operations
 */

import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
  /**
   * GET /api/analytics/overview
   * Get overall statistics
   */
  static getOverview = catchAsync(async (req: Request, res: Response) => {
    const stats = await AnalyticsService.getOverview(req.user!.id);

    sendSuccess(res, stats);
  });

  /**
   * GET /api/analytics/trends
   * Get completion trends over time
   */
  static getTrends = catchAsync(async (req: Request, res: Response) => {
    const { period = '30' } = req.query;
    const days = parseInt(period as string, 10);

    const trends = await AnalyticsService.getTrends(req.user!.id, days);

    sendSuccess(res, { trends, count: trends.length });
  });

  /**
   * GET /api/analytics/insights
   * Get generated insights about habits
   */
  static getInsights = catchAsync(async (req: Request, res: Response) => {
    const insights = await AnalyticsService.generateInsights(req.user!.id);

    sendSuccess(res, { insights, count: insights.length });
  });
}
