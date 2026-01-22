/**
 * Completion Controller
 * Handles habit completion tracking
 */

import { Request, Response } from 'express';
import { CompletionService } from '../services/CompletionService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';

export class CompletionController {
  /**
   * POST /api/completions
   * Mark habit as complete
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const completion = await CompletionService.create(req.user!.id, req.body);

    sendCreated(res, { completion }, 'Habit marked as complete');
  });

  /**
   * DELETE /api/completions/:habitId/:date
   * Unmark habit completion
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    const { habitId, date } = req.params;

    await CompletionService.delete(req.user!.id, habitId, date);

    sendSuccess(res, null, 'Completion removed');
  });

  /**
   * GET /api/completions
   * Get completions with optional filters
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { habitId, startDate, endDate } = req.query;

    const completions = await CompletionService.getAll(req.user!.id, {
      habitId: habitId as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    sendSuccess(res, { completions, count: completions.length });
  });

  /**
   * GET /api/completions/calendar/:year/:month
   * Get monthly calendar data
   */
  static getMonthlyCalendar = catchAsync(async (req: Request, res: Response) => {
    const { year, month } = req.params;

    const data = await CompletionService.getMonthlyCalendar(
      req.user!.id,
      parseInt(year, 10),
      parseInt(month, 10)
    );

    sendSuccess(res, data);
  });
}
