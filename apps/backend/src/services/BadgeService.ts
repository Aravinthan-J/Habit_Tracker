import { prisma } from '../config/database';
import { NotFoundError } from '../utils/AppError';

/**
 * Badge definition with unlock requirements
 */
export interface BadgeDefinition {
  name: string;
  description: string;
  type: 'streak' | 'completion' | 'step' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  iconName: string;
  category?: string;
}

/**
 * Badge progress information
 */
export interface BadgeProgress {
  badge: {
    id: string;
    name: string;
    description: string;
    type: string;
    tier: string;
    requirement: number;
    iconName: string;
    category: string | null;
  };
  earned: boolean;
  earnedAt?: Date;
  currentProgress: number;
  progressPercentage: number;
}

/**
 * Default badge definitions to seed
 */
export const DEFAULT_BADGES: BadgeDefinition[] = [
  // Streak badges
  {
    name: '21-Day Warrior',
    description: 'Complete a habit for 21 consecutive days',
    type: 'streak',
    tier: 'bronze',
    requirement: 21,
    iconName: 'shield-checkmark',
    category: 'streak',
  },
  {
    name: '45-Day Champion',
    description: 'Complete a habit for 45 consecutive days',
    type: 'streak',
    tier: 'silver',
    requirement: 45,
    iconName: 'trophy',
    category: 'streak',
  },
  {
    name: '100-Day Legend',
    description: 'Complete a habit for 100 consecutive days',
    type: 'streak',
    tier: 'gold',
    requirement: 100,
    iconName: 'star',
    category: 'streak',
  },
  {
    name: '365-Day Master',
    description: 'Complete a habit for a full year',
    type: 'streak',
    tier: 'platinum',
    requirement: 365,
    iconName: 'medal',
    category: 'streak',
  },
  // Completion badges
  {
    name: 'First Steps',
    description: 'Complete your first 10 habits',
    type: 'completion',
    tier: 'bronze',
    requirement: 10,
    iconName: 'walk',
    category: 'completion',
  },
  {
    name: '100 Completions Club',
    description: 'Complete 100 total habit check-ins',
    type: 'completion',
    tier: 'bronze',
    requirement: 100,
    iconName: 'checkmark-circle',
    category: 'completion',
  },
  {
    name: '500 Completions Club',
    description: 'Complete 500 total habit check-ins',
    type: 'completion',
    tier: 'silver',
    requirement: 500,
    iconName: 'checkmark-done-circle',
    category: 'completion',
  },
  {
    name: '1000 Completions Club',
    description: 'Complete 1000 total habit check-ins',
    type: 'completion',
    tier: 'gold',
    requirement: 1000,
    iconName: 'ribbon',
    category: 'completion',
  },
  {
    name: '5000 Completions Club',
    description: 'Complete 5000 total habit check-ins',
    type: 'completion',
    tier: 'platinum',
    requirement: 5000,
    iconName: 'diamond',
    category: 'completion',
  },
  {
    name: 'Perfect Week',
    description: 'Complete all habits for 7 consecutive days',
    type: 'completion',
    tier: 'silver',
    requirement: 7,
    iconName: 'calendar',
    category: 'special',
  },
  {
    name: 'Perfect Month',
    description: 'Hit your monthly goal for all habits',
    type: 'completion',
    tier: 'gold',
    requirement: 1,
    iconName: 'calendar-outline',
    category: 'special',
  },
  {
    name: 'Early Bird',
    description: 'Complete 7 habits before 9 AM',
    type: 'special',
    tier: 'bronze',
    requirement: 7,
    iconName: 'sunny',
    category: 'time',
  },
  {
    name: 'Night Owl',
    description: 'Complete 7 habits after 9 PM',
    type: 'special',
    tier: 'bronze',
    requirement: 7,
    iconName: 'moon',
    category: 'time',
  },
  {
    name: 'Comeback Kid',
    description: 'Resume a habit within 3 days of missing it',
    type: 'special',
    tier: 'bronze',
    requirement: 1,
    iconName: 'refresh',
    category: 'special',
  },
  // Step badges
  {
    name: '10K Walker',
    description: 'Walk 10,000 steps in a single day',
    type: 'step',
    tier: 'bronze',
    requirement: 10000,
    iconName: 'footsteps',
    category: 'steps',
  },
  {
    name: 'Step Streak 7',
    description: 'Hit your step goal for 7 consecutive days',
    type: 'step',
    tier: 'bronze',
    requirement: 7,
    iconName: 'flame',
    category: 'steps',
  },
  {
    name: 'Step Streak 14',
    description: 'Hit your step goal for 14 consecutive days',
    type: 'step',
    tier: 'silver',
    requirement: 14,
    iconName: 'flame',
    category: 'steps',
  },
  {
    name: 'Step Streak 30',
    description: 'Hit your step goal for 30 consecutive days',
    type: 'step',
    tier: 'gold',
    requirement: 30,
    iconName: 'flame',
    category: 'steps',
  },
  {
    name: 'Marathon Month',
    description: 'Average 10,000+ steps for 30 days',
    type: 'step',
    tier: 'gold',
    requirement: 300000,
    iconName: 'fitness',
    category: 'steps',
  },
  {
    name: '100km Journey',
    description: 'Walk a total of 100 kilometers',
    type: 'step',
    tier: 'bronze',
    requirement: 100000,
    iconName: 'map',
    category: 'distance',
  },
  {
    name: '500km Explorer',
    description: 'Walk a total of 500 kilometers',
    type: 'step',
    tier: 'silver',
    requirement: 500000,
    iconName: 'compass',
    category: 'distance',
  },
  {
    name: '1000km Adventurer',
    description: 'Walk a total of 1000 kilometers',
    type: 'step',
    tier: 'gold',
    requirement: 1000000,
    iconName: 'earth',
    category: 'distance',
  },
];

/**
 * Service for handling badge operations
 */
export class BadgeService {
  /**
   * Seed default badges into the database
   */
  static async seedBadges(): Promise<void> {
    for (const badge of DEFAULT_BADGES) {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
    }
  }

  /**
   * Get all available badges
   */
  static async getAllBadges() {
    return prisma.badge.findMany({
      orderBy: [{ type: 'asc' }, { tier: 'asc' }, { requirement: 'asc' }],
    });
  }

  /**
   * Get a badge by ID
   */
  static async getBadgeById(badgeId: string) {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new NotFoundError('Badge');
    }

    return badge;
  }

  /**
   * Get user's earned badges
   */
  static async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });
  }

  /**
   * Unlock a badge for a user
   */
  static async unlockBadge(
    userId: string,
    badgeId: string,
    habitId?: string
  ) {
    // Check if already earned
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });

    if (existing) {
      return null; // Already earned
    }

    return prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        habitId,
      },
      include: {
        badge: true,
      },
    });
  }

  /**
   * Check and unlock badges based on user's progress
   * Returns newly unlocked badges
   */
  static async checkAndUnlockBadges(userId: string, habitId?: string) {
    const newlyUnlocked: any[] = [];
    const allBadges = await this.getAllBadges();
    const earnedBadges = await this.getUserBadges(userId);
    const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));

    // Get user stats for badge checking
    const stats = await this.getUserStatsForBadges(userId);

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const shouldUnlock = await this.checkBadgeCondition(
        badge,
        stats,
        userId,
        habitId
      );

      if (shouldUnlock) {
        const unlocked = await this.unlockBadge(userId, badge.id, habitId);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get user stats needed for badge checking
   */
  private static async getUserStatsForBadges(userId: string) {
    // Get total completions
    const totalCompletions = await prisma.completion.count({
      where: { userId },
    });

    // Get all completions for streak calculation
    const completions = await prisma.completion.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true, habitId: true, completedAt: true },
    });

    // Get step data
    const stepData = await prisma.stepData.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Get user's step goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true },
    });

    // Calculate max streak per habit
    const habitStreaks = this.calculateHabitStreaks(completions);

    // Calculate step stats
    const stepStats = this.calculateStepStats(stepData, user?.stepGoal || 10000);

    // Count early/late completions
    const earlyCompletions = completions.filter((c) => {
      const hour = new Date(c.completedAt).getHours();
      return hour < 9;
    }).length;

    const lateCompletions = completions.filter((c) => {
      const hour = new Date(c.completedAt).getHours();
      return hour >= 21;
    }).length;

    return {
      totalCompletions,
      habitStreaks,
      stepStats,
      earlyCompletions,
      lateCompletions,
      completions,
      stepData,
    };
  }

  /**
   * Calculate streaks for each habit
   */
  private static calculateHabitStreaks(
    completions: { date: Date; habitId: string }[]
  ) {
    const habitMap = new Map<string, Date[]>();

    // Group completions by habit
    for (const c of completions) {
      const dates = habitMap.get(c.habitId) || [];
      dates.push(c.date);
      habitMap.set(c.habitId, dates);
    }

    // Calculate max streak for each habit
    const streaks: { habitId: string; maxStreak: number; currentStreak: number }[] = [];

    habitMap.forEach((dates, habitId) => {
      const sortedDates = dates
        .map((d) => new Date(d).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a);

      let maxStreak = 0;
      let currentStreak = 0;
      let tempStreak = 1;

      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = today - 86400000;

      // Check if current streak is active
      const hasRecentCompletion =
        sortedDates.includes(today) || sortedDates.includes(yesterday);

      for (let i = 1; i < sortedDates.length; i++) {
        const diff = sortedDates[i - 1] - sortedDates[i];
        if (diff === 86400000) {
          // Exactly one day
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak);

      if (hasRecentCompletion) {
        currentStreak = tempStreak;
      }

      streaks.push({ habitId, maxStreak, currentStreak });
    });

    return streaks;
  }

  /**
   * Calculate step statistics
   */
  private static calculateStepStats(
    stepData: { steps: number; distance: number; date: Date }[],
    stepGoal: number
  ) {
    if (stepData.length === 0) {
      return {
        maxSteps: 0,
        totalDistance: 0,
        stepStreak: 0,
        avgSteps30Days: 0,
      };
    }

    const maxSteps = Math.max(...stepData.map((s) => s.steps));
    const totalDistance = stepData.reduce((sum, s) => sum + s.distance, 0);

    // Calculate step streak (consecutive days hitting goal)
    let stepStreak = 0;
    const sortedSteps = [...stepData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const step of sortedSteps) {
      if (step.steps >= stepGoal) {
        stepStreak++;
      } else {
        break;
      }
    }

    // Calculate 30-day average
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSteps = stepData.filter(
      (s) => new Date(s.date) >= thirtyDaysAgo
    );
    const avgSteps30Days =
      recentSteps.length > 0
        ? recentSteps.reduce((sum, s) => sum + s.steps, 0) / recentSteps.length
        : 0;

    return { maxSteps, totalDistance, stepStreak, avgSteps30Days };
  }

  /**
   * Check if a specific badge condition is met
   */
  private static async checkBadgeCondition(
    badge: any,
    stats: any,
    userId: string,
    habitId?: string
  ): Promise<boolean> {
    switch (badge.type) {
      case 'completion':
        return this.checkCompletionBadge(badge, stats);
      case 'streak':
        return this.checkStreakBadge(badge, stats);
      case 'step':
        return this.checkStepBadge(badge, stats);
      case 'special':
        return this.checkSpecialBadge(badge, stats, userId);
      default:
        return false;
    }
  }

  /**
   * Check completion-based badges
   */
  private static checkCompletionBadge(badge: any, stats: any): boolean {
    if (badge.name.includes('Completions Club') || badge.name === 'First Steps') {
      return stats.totalCompletions >= badge.requirement;
    }
    return false;
  }

  /**
   * Check streak-based badges
   */
  private static checkStreakBadge(badge: any, stats: any): boolean {
    const maxStreak = Math.max(
      ...stats.habitStreaks.map((s: any) => s.maxStreak),
      0
    );
    return maxStreak >= badge.requirement;
  }

  /**
   * Check step-based badges
   */
  private static checkStepBadge(badge: any, stats: any): boolean {
    switch (badge.name) {
      case '10K Walker':
        return stats.stepStats.maxSteps >= 10000;
      case 'Step Streak 7':
        return stats.stepStats.stepStreak >= 7;
      case 'Step Streak 14':
        return stats.stepStats.stepStreak >= 14;
      case 'Step Streak 30':
        return stats.stepStats.stepStreak >= 30;
      case 'Marathon Month':
        return stats.stepStats.avgSteps30Days >= 10000;
      case '100km Journey':
        return stats.stepStats.totalDistance >= 100000;
      case '500km Explorer':
        return stats.stepStats.totalDistance >= 500000;
      case '1000km Adventurer':
        return stats.stepStats.totalDistance >= 1000000;
      default:
        return false;
    }
  }

  /**
   * Check special badges
   */
  private static checkSpecialBadge(
    badge: any,
    stats: any,
    userId: string
  ): boolean {
    switch (badge.name) {
      case 'Early Bird':
        return stats.earlyCompletions >= 7;
      case 'Night Owl':
        return stats.lateCompletions >= 7;
      default:
        return false;
    }
  }

  /**
   * Get progress toward all badges
   */
  static async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    const allBadges = await this.getAllBadges();
    const earnedBadges = await this.getUserBadges(userId);
    const earnedMap = new Map(
      earnedBadges.map((ub) => [ub.badgeId, ub.earnedAt])
    );
    const stats = await this.getUserStatsForBadges(userId);

    return allBadges.map((badge) => {
      const earned = earnedMap.has(badge.id);
      const currentProgress = this.calculateBadgeProgress(badge, stats);

      return {
        badge: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          type: badge.type,
          tier: badge.tier,
          requirement: badge.requirement,
          iconName: badge.iconName,
          category: badge.category,
        },
        earned,
        earnedAt: earnedMap.get(badge.id),
        currentProgress,
        progressPercentage: Math.min(
          100,
          Math.round((currentProgress / badge.requirement) * 100)
        ),
      };
    });
  }

  /**
   * Calculate current progress toward a badge
   */
  private static calculateBadgeProgress(badge: any, stats: any): number {
    switch (badge.type) {
      case 'completion':
        if (badge.name.includes('Completions Club') || badge.name === 'First Steps') {
          return stats.totalCompletions;
        }
        return 0;
      case 'streak':
        return Math.max(...stats.habitStreaks.map((s: any) => s.maxStreak), 0);
      case 'step':
        if (badge.name === '10K Walker') return stats.stepStats.maxSteps;
        if (badge.name.includes('Step Streak'))
          return stats.stepStats.stepStreak;
        if (badge.name === 'Marathon Month')
          return Math.round(stats.stepStats.avgSteps30Days);
        if (badge.name.includes('km'))
          return Math.round(stats.stepStats.totalDistance);
        return 0;
      case 'special':
        if (badge.name === 'Early Bird') return stats.earlyCompletions;
        if (badge.name === 'Night Owl') return stats.lateCompletions;
        return 0;
      default:
        return 0;
    }
  }
}
