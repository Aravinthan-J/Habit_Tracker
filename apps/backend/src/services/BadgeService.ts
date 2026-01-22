/**
 * Badge Service
 * Handles badge unlock logic and progress tracking
 */

import { PrismaClient, Badge, UserBadge } from '@prisma/client';

const prisma = new PrismaClient();

interface BadgeProgress {
  badge: Badge;
  current: number;
  required: number;
  percentage: number;
  daysRemaining?: number;
}

interface UnlockedBadge {
  badge: Badge;
  message: string;
}

export class BadgeService {
  /**
   * Get all 30 badge definitions
   */
  static async getAllBadges(): Promise<Badge[]> {
    return await prisma.badge.findMany({
      orderBy: [{ type: 'asc' }, { requirement: 'asc' }],
    });
  }

  /**
   * Get badges user has earned
   */
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  /**
   * Check if user unlocked new badges (main logic)
   * Called after every habit completion
   */
  static async checkAndUnlockBadges(
    userId: string,
    habitId?: string
  ): Promise<UnlockedBadge[]> {
    const newBadges: UnlockedBadge[] = [];

    // 1. CHECK STREAK BADGES (21, 45, 100, 365 days)
    const streakBadges = await this.checkStreakBadges(userId, habitId);
    newBadges.push(...streakBadges);

    // 2. CHECK COMPLETION BADGES (Perfect Week, Perfect Month, etc.)
    const completionBadges = await this.checkCompletionBadges(userId);
    newBadges.push(...completionBadges);

    // 3. CHECK VOLUME BADGES (100, 500, 1000, 5000 total completions)
    const volumeBadges = await this.checkVolumeBadges(userId);
    newBadges.push(...volumeBadges);

    return newBadges;
  }

  /**
   * Calculate progress toward all unearned badges
   */
  static async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    const allBadges = await this.getAllBadges();
    const earnedBadges = await this.getUserBadges(userId);
    const earnedBadgeIds = earnedBadges.map((ub) => ub.badgeId);

    const progress: BadgeProgress[] = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      const current = await this.calculateCurrentProgress(userId, badge);
      const percentage = Math.min(100, Math.round((current / badge.requirement) * 100));

      progress.push({
        badge,
        current,
        required: badge.requirement,
        percentage,
        daysRemaining: badge.requirement - current,
      });
    }

    return progress.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Calculate current progress for a specific badge
   */
  private static async calculateCurrentProgress(
    userId: string,
    badge: Badge
  ): Promise<number> {
    switch (badge.type) {
      case 'streak': {
        // Get max streak across all habits
        const habits = await prisma.habit.findMany({
          where: { userId, archivedAt: null },
        });

        let maxStreak = 0;
        for (const habit of habits) {
          const streak = await this.calculateHabitStreak(habit.id);
          maxStreak = Math.max(maxStreak, streak);
        }
        return maxStreak;
      }

      case 'volume': {
        // Total completions across all habits
        const count = await prisma.completion.count({
          where: { userId },
        });
        return count;
      }

      case 'completion': {
        // Handle different completion types
        if (badge.name === 'Perfect Week') {
          return await this.checkPerfectWeekProgress(userId);
        }
        return 0;
      }

      default:
        return 0;
    }
  }

  /**
   * Check streak badges
   */
  private static async checkStreakBadges(
    userId: string,
    habitId?: string
  ): Promise<UnlockedBadge[]> {
    const newBadges: UnlockedBadge[] = [];

    // Get habits to check
    const habits = habitId
      ? [await prisma.habit.findUnique({ where: { id: habitId } })]
      : await prisma.habit.findMany({ where: { userId, archivedAt: null } });

    for (const habit of habits.filter(Boolean)) {
      if (!habit) continue;

      const streak = await this.calculateHabitStreak(habit.id);

      // Check against badge requirements
      if (streak >= 21) {
        const badge = await this.awardBadgeIfNew(userId, '21-Day Warrior', habit.id);
        if (badge) {
          newBadges.push({
            badge: badge.badge,
            message: `You've completed ${habit.title} for 21 days straight!`,
          });
        }
      }
      if (streak >= 45) {
        const badge = await this.awardBadgeIfNew(userId, '45-Day Champion', habit.id);
        if (badge) {
          newBadges.push({
            badge: badge.badge,
            message: `You've completed ${habit.title} for 45 days straight!`,
          });
        }
      }
      if (streak >= 100) {
        const badge = await this.awardBadgeIfNew(userId, '100-Day Legend', habit.id);
        if (badge) {
          newBadges.push({
            badge: badge.badge,
            message: `You've completed ${habit.title} for 100 days straight!`,
          });
        }
      }
      if (streak >= 365) {
        const badge = await this.awardBadgeIfNew(userId, '365-Day Master', habit.id);
        if (badge) {
          newBadges.push({
            badge: badge.badge,
            message: `You've completed ${habit.title} for an entire year!`,
          });
        }
      }
    }

    return newBadges;
  }

  /**
   * Check completion badges (Perfect Week, etc.)
   */
  private static async checkCompletionBadges(userId: string): Promise<UnlockedBadge[]> {
    const newBadges: UnlockedBadge[] = [];

    // Check Perfect Week
    const isPerfectWeek = await this.isPerfectWeek(userId);
    if (isPerfectWeek) {
      const badge = await this.awardBadgeIfNew(userId, 'Perfect Week');
      if (badge) {
        newBadges.push({
          badge: badge.badge,
          message: "You've completed all habits for 7 consecutive days!",
        });
      }
    }

    return newBadges;
  }

  /**
   * Check volume badges (100, 500, 1000, 5000 completions)
   */
  private static async checkVolumeBadges(userId: string): Promise<UnlockedBadge[]> {
    const newBadges: UnlockedBadge[] = [];

    const totalCompletions = await prisma.completion.count({
      where: { userId },
    });

    if (totalCompletions >= 100) {
      const badge = await this.awardBadgeIfNew(userId, '100 Completions Club');
      if (badge) {
        newBadges.push({
          badge: badge.badge,
          message: "You've completed 100 habits!",
        });
      }
    }
    if (totalCompletions >= 500) {
      const badge = await this.awardBadgeIfNew(userId, '500 Completions Club');
      if (badge) {
        newBadges.push({
          badge: badge.badge,
          message: "You've completed 500 habits!",
        });
      }
    }
    if (totalCompletions >= 1000) {
      const badge = await this.awardBadgeIfNew(userId, '1000 Completions Club');
      if (badge) {
        newBadges.push({
          badge: badge.badge,
          message: "You've completed 1000 habits!",
        });
      }
    }
    if (totalCompletions >= 5000) {
      const badge = await this.awardBadgeIfNew(userId, '5000 Completions Club');
      if (badge) {
        newBadges.push({
          badge: badge.badge,
          message: "You've completed 5000 habits!",
        });
      }
    }

    return newBadges;
  }

  /**
   * Calculate current streak for a habit
   */
  private static async calculateHabitStreak(habitId: string): Promise<number> {
    const completions = await prisma.completion.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    if (completions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's a completion today or yesterday
    const lastCompletion = new Date(completions[0].date);
    lastCompletion.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 1) return 0; // Streak broken

    // Calculate streak
    for (let i = 0; i < completions.length; i++) {
      const compDate = new Date(completions[i].date);
      compDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (compDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Check if user has perfect week
   */
  private static async isPerfectWeek(userId: string): Promise<boolean> {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
    });

    if (habits.length === 0) return false;

    // Get last 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    // Check if all habits were completed for all 7 days
    for (const date of dates) {
      for (const habit of habits) {
        const completion = await prisma.completion.findUnique({
          where: {
            habitId_date: {
              habitId: habit.id,
              date,
            },
          },
        });
        if (!completion) return false;
      }
    }

    return true;
  }

  /**
   * Check progress toward perfect week (for progress calculation)
   */
  private static async checkPerfectWeekProgress(userId: string): Promise<number> {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
    });

    if (habits.length === 0) return 0;

    // Get last 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    let perfectDays = 0;

    // Count how many days had all habits completed
    for (const date of dates) {
      let allCompleted = true;
      for (const habit of habits) {
        const completion = await prisma.completion.findUnique({
          where: {
            habitId_date: {
              habitId: habit.id,
              date,
            },
          },
        });
        if (!completion) {
          allCompleted = false;
          break;
        }
      }
      if (allCompleted) perfectDays++;
    }

    return perfectDays;
  }

  /**
   * Award badge to user if they haven't earned it yet
   */
  private static async awardBadgeIfNew(
    userId: string,
    badgeName: string,
    habitId?: string
  ): Promise<UserBadge | null> {
    const badge = await prisma.badge.findUnique({
      where: { name: badgeName },
    });

    if (!badge) return null;

    // Check if user already has this badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) return null;

    // Award badge
    return await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
        habitId,
      },
      include: { badge: true },
    });
  }
}
