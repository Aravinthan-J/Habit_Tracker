/**
 * Step Controller
 * Handles step tracking operations
 */

import { Request, Response } from 'express';
import { StepService } from '../services/StepService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';

export class StepController {
  /**
   * POST /api/steps
   * Log step data for a day
   */
  static logSteps = catchAsync(async (req: Request, res: Response) => {
    const { date, steps, distance, calories, activeMinutes, source } = req.body;

    const stepData = await StepService.logSteps(
      req.user!.id,
      date,
      steps,
      distance,
      calories,
      activeMinutes,
      source
    );

    sendCreated(res, { stepData }, 'Step data saved successfully');
  });

  /**
   * GET /api/steps
   * Get step data for date range
   */
  static getSteps = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const stepData = await StepService.getSteps(
      req.user!.id,
      startDate as string,
      endDate as string
    );

    sendSuccess(res, { stepData, count: stepData.length });
  });

  /**
   * GET /api/steps/today
   * Get today's steps
   */
  static getTodaySteps = catchAsync(async (req: Request, res: Response) => {
    const stepData = await StepService.getTodaySteps(req.user!.id);
    const stepGoal = await StepService.getStepGoal(req.user!.id);

    const response = stepData
      ? {
          ...stepData,
          goalReached: stepData.steps >= stepGoal,
          stepGoal,
        }
      : {
          date: new Date().toISOString().split('T')[0],
          steps: 0,
          distance: 0,
          calories: 0,
          activeMinutes: 0,
          goalReached: false,
          stepGoal,
        };

    sendSuccess(res, { stepData: response });
  });

  /**
   * GET /api/steps/stats
   * Get lifetime step statistics
   */
  static getStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StepService.getStats(req.user!.id);

    sendSuccess(res, stats);
  });

  /**
   * GET /api/steps/goal
   * Get user's step goal
   */
  static getStepGoal = catchAsync(async (req: Request, res: Response) => {
    const stepGoal = await StepService.getStepGoal(req.user!.id);

    sendSuccess(res, { stepGoal });
  });

  /**
   * PUT /api/steps/goal
   * Update user's step goal
   */
  static updateStepGoal = catchAsync(async (req: Request, res: Response) => {
    const { stepGoal } = req.body;

    await StepService.updateStepGoal(req.user!.id, stepGoal);

    sendSuccess(res, { stepGoal }, 'Step goal updated successfully');
  });
}
