/**
 * Badge Controller
 * Handles badge-related operations
 */

import { Request, Response } from 'express';
import { BadgeService } from '../services/BadgeService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

export class BadgeController {
  /**
   * GET /api/badges
   * Get all badge definitions
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const badges = await BadgeService.getAllBadges();

    sendSuccess(res, { badges, count: badges.length });
  });

  /**
   * GET /api/badges/user
   * Get user's earned badges
   */
  static getUserBadges = catchAsync(async (req: Request, res: Response) => {
    const badges = await BadgeService.getUserBadges(req.user!.id);

    sendSuccess(res, { badges, count: badges.length });
  });

  /**
   * POST /api/badges/check
   * Check if user unlocked any new badges
   */
  static checkUnlocks = catchAsync(async (req: Request, res: Response) => {
    const { habitId } = req.body;

    const newBadges = await BadgeService.checkAndUnlockBadges(req.user!.id, habitId);

    sendSuccess(res, { newBadges, count: newBadges.length });
  });

  /**
   * GET /api/badges/progress
   * Get progress toward all unearned badges
   */
  static getProgress = catchAsync(async (req: Request, res: Response) => {
    const progress = await BadgeService.getBadgeProgress(req.user!.id);

    sendSuccess(res, { progress, count: progress.length });
  });
}
