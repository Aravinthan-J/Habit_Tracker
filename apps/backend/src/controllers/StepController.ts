import { Request, Response } from 'express';
import { StepService } from '../services/StepService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';
import { BadgeService } from '../services/BadgeService';

/**
 * Controller for step data endpoints
 */
export class StepController {
  /**
   * Log step data
   * POST /api/steps
   */
  static logSteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { date, steps, distance, calories, activeMinutes, source } = req.body;

    const stepData = await StepService.logSteps(userId, {
      date: new Date(date),
      steps,
      distance,
      calories,
      activeMinutes,
      source,
    });

    // Check for step-related badges
    const newBadges = await BadgeService.checkAndUnlockBadges(userId);

    sendCreated(
      res,
      {
        stepData,
        newBadges: newBadges.length > 0 ? newBadges : undefined,
      },
      'Step data logged successfully'
    );
  });

  /**
   * Get step data for a date range
   * GET /api/steps?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  static getSteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    const stepData = await StepService.getSteps(userId, start, end);

    sendSuccess(
      res,
      { stepData, count: stepData.length },
      'Step data retrieved successfully'
    );
  });

  /**
   * Get today's step data
   * GET /api/steps/today
   */
  static getTodaySteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const todayData = await StepService.getTodaySteps(userId);

    sendSuccess(res, todayData, "Today's step data retrieved successfully");
  });

  /**
   * Get step statistics
   * GET /api/steps/stats
   */
  static getStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await StepService.getStats(userId);

    sendSuccess(res, { stats }, 'Step statistics retrieved successfully');
  });

  /**
   * Get weekly step data
   * GET /api/steps/weekly
   */
  static getWeeklySteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const weeklyData = await StepService.getWeeklySteps(userId);

    sendSuccess(res, { weeklyData }, 'Weekly step data retrieved successfully');
  });

  /**
   * Get monthly step summary
   * GET /api/steps/monthly?year=YYYY&month=MM
   */
  static getMonthlySteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { year, month } = req.query;

    const now = new Date();
    const y = year ? parseInt(year as string, 10) : now.getFullYear();
    const m = month ? parseInt(month as string, 10) : now.getMonth() + 1;

    const monthlyData = await StepService.getMonthlySteps(userId, y, m);

    sendSuccess(res, { monthlyData }, 'Monthly step data retrieved successfully');
  });

  /**
   * Update step data for a specific date
   * PATCH /api/steps/:date
   */
  static updateSteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { date } = req.params;
    const { steps, distance, calories, activeMinutes, source } = req.body;

    const stepData = await StepService.updateSteps(userId, new Date(date), {
      steps,
      distance,
      calories,
      activeMinutes,
      source,
    });

    sendSuccess(res, { stepData }, 'Step data updated successfully');
  });

  /**
   * Delete step data for a specific date
   * DELETE /api/steps/:date
   */
  static deleteSteps = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { date } = req.params;

    await StepService.deleteSteps(userId, new Date(date));

    sendSuccess(res, undefined, 'Step data deleted successfully');
  });
}
