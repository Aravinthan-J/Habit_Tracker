import { Request, Response } from 'express';
import { BadgeService } from '../services/BadgeService';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/response';

/**
 * Controller for badge endpoints
 */
export class BadgeController {
  /**
   * Get all available badges
   * GET /api/badges
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const badges = await BadgeService.getAllBadges();

    sendSuccess(res, { badges, count: badges.length }, 'Badges retrieved successfully');
  });

  /**
   * Get user's earned badges
   * GET /api/badges/user
   */
  static getUserBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const userBadges = await BadgeService.getUserBadges(userId);

    sendSuccess(
      res,
      { badges: userBadges, count: userBadges.length },
      'User badges retrieved successfully'
    );
  });

  /**
   * Get a single badge by ID
   * GET /api/badges/:id
   */
  static getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const badge = await BadgeService.getBadgeById(id);

    sendSuccess(res, { badge }, 'Badge retrieved successfully');
  });

  /**
   * Check and unlock badges for user
   * POST /api/badges/check
   */
  static checkAndUnlock = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { habitId } = req.body;

    const newlyUnlocked = await BadgeService.checkAndUnlockBadges(
      userId,
      habitId
    );

    sendSuccess(
      res,
      {
        newlyUnlocked,
        count: newlyUnlocked.length,
      },
      newlyUnlocked.length > 0
        ? `Congratulations! You unlocked ${newlyUnlocked.length} new badge(s)!`
        : 'No new badges unlocked'
    );
  });

  /**
   * Get progress toward all badges
   * GET /api/badges/progress
   */
  static getProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const progress = await BadgeService.getBadgeProgress(userId);

    const earned = progress.filter((p) => p.earned);
    const locked = progress.filter((p) => !p.earned);

    sendSuccess(
      res,
      {
        progress,
        summary: {
          total: progress.length,
          earned: earned.length,
          locked: locked.length,
        },
      },
      'Badge progress retrieved successfully'
    );
  });

  /**
   * Seed badges (admin only - should be protected in production)
   * POST /api/badges/seed
   */
  static seedBadges = catchAsync(async (req: Request, res: Response) => {
    await BadgeService.seedBadges();

    sendSuccess(res, undefined, 'Badges seeded successfully');
  });
}
