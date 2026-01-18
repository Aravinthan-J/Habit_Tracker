import { Request, Response } from 'express';
import { CompletionService } from '../services/CompletionService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated } from '../utils/response';
import {
  CreateCompletionInput,
  GetCompletionsQuery,
} from '../validators/completion.validator';

/**
 * Controller for completion endpoints
 */
export class CompletionController {
  /**
   * Mark a habit as complete
   * POST /api/completions
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: CreateCompletionInput = req.body;

    const completion = await CompletionService.create(userId, data);

    sendCreated(res, { completion }, 'Habit marked as complete');
  });

  /**
   * Unmark a habit completion
   * DELETE /api/completions/:habitId/:date
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { habitId, date } = req.params;

    await CompletionService.delete(userId, habitId, date);

    sendSuccess(res, undefined, 'Completion removed successfully');
  });

  /**
   * Get completions with optional filters
   * GET /api/completions
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const query: GetCompletionsQuery = req.query as any;

    const completions = await CompletionService.getAll(userId, {
      habitId: query.habitId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    sendSuccess(
      res,
      { completions, count: completions.length },
      'Completions retrieved successfully'
    );
  });

  /**
   * Get monthly calendar view
   * GET /api/completions/calendar/:year/:month
   */
  static getMonthlyCalendar = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    const calendar = await CompletionService.getMonthlyCalendar(userId, year, month);

    sendSuccess(
      res,
      { calendar, year, month },
      'Monthly calendar retrieved successfully'
    );
  });
}
