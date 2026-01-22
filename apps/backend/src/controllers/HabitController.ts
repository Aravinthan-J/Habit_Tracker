/**
 * Habit Controller
 * Handles habit CRUD operations
 */

import { Request, Response } from 'express';
import { HabitService } from '../services/HabitService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class HabitController {
  /**
   * POST /api/habits
   * Create a new habit
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const habit = await HabitService.create(req.user!.id, req.body);

    sendCreated(res, { habit }, 'Habit created successfully');
  });

  /**
   * GET /api/habits
   * Get all user habits
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { archived } = req.query;
    const includeArchived = archived === 'true';

    const habits = await HabitService.getAll(req.user!.id, includeArchived);

    sendSuccess(res, { habits, count: habits.length });
  });

  /**
   * GET /api/habits/:id
   * Get single habit by ID
   */
  static getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const habit = await HabitService.getById(id, req.user!.id);

    sendSuccess(res, { habit });
  });

  /**
   * PATCH /api/habits/:id
   * Update habit
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const habit = await HabitService.update(id, req.user!.id, req.body);

    sendSuccess(res, { habit }, 'Habit updated successfully');
  });

  /**
   * DELETE /api/habits/:id
   * Delete habit (soft delete)
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await HabitService.delete(id, req.user!.id);

    sendSuccess(res, null, 'Habit deleted successfully');
  });

  /**
   * GET /api/habits/:id/stats
   * Get habit statistics
   */
  static getStats = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const stats = await HabitService.getStats(id, req.user!.id);

    sendSuccess(res, { stats });
  });
}
