import { Request, Response } from 'express';
import { HabitService } from '../services/HabitService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import {
  CreateHabitInput,
  UpdateHabitInput,
  GetHabitsQuery,
} from '../validators/habit.validator';

/**
 * Controller for habit endpoints
 */
export class HabitController {
  /**
   * Create a new habit
   * POST /api/habits
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: CreateHabitInput = req.body;

    const habit = await HabitService.create(userId, data);

    sendCreated(res, { habit }, 'Habit created successfully');
  });

  /**
   * Get all habits for the authenticated user
   * GET /api/habits
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const query: GetHabitsQuery = req.query as any;

    const habits = await HabitService.getAll(userId, query.archived);

    sendSuccess(res, { habits, count: habits.length }, 'Habits retrieved successfully');
  });

  /**
   * Get a single habit by ID
   * GET /api/habits/:id
   */
  static getById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const habit = await HabitService.getById(id, userId);

    sendSuccess(res, { habit }, 'Habit retrieved successfully');
  });

  /**
   * Update a habit
   * PATCH /api/habits/:id
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data: UpdateHabitInput = req.body;

    const habit = await HabitService.update(id, userId, data);

    sendSuccess(res, { habit }, 'Habit updated successfully');
  });

  /**
   * Delete (archive) a habit
   * DELETE /api/habits/:id
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await HabitService.delete(id, userId);

    sendSuccess(res, undefined, 'Habit archived successfully');
  });

  /**
   * Get habit statistics
   * GET /api/habits/:id/stats
   */
  static getStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const stats = await HabitService.getStats(id, userId);

    sendSuccess(res, { habit: stats }, 'Habit stats retrieved successfully');
  });
}
