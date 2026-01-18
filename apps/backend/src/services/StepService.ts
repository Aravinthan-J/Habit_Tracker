import { prisma } from '../config/database';
import { NotFoundError } from '../utils/AppError';

/**
 * Input for logging step data
 */
export interface LogStepsInput {
  date: Date;
  steps: number;
  distance: number;
  calories?: number;
  activeMinutes?: number;
  source?: string;
}

/**
 * Step statistics
 */
export interface StepStats {
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  totalActiveMinutes: number;
  averageSteps: number;
  averageDistance: number;
  bestDay: {
    date: Date;
    steps: number;
  } | null;
  currentStreak: number;
  longestStreak: number;
  daysTracked: number;
  goalAchievedDays: number;
}

/**
 * Service for handling step data operations
 */
export class StepService {
  /**
   * Log or update step data for a specific date
   */
  static async logSteps(userId: string, data: LogStepsInput) {
    const dateOnly = new Date(data.date);
    dateOnly.setHours(0, 0, 0, 0);

    return prisma.stepData.upsert({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      update: {
        steps: data.steps,
        distance: data.distance,
        calories: data.calories,
        activeMinutes: data.activeMinutes,
        source: data.source || 'manual',
      },
      create: {
        userId,
        date: dateOnly,
        steps: data.steps,
        distance: data.distance,
        calories: data.calories,
        activeMinutes: data.activeMinutes,
        source: data.source || 'manual',
      },
    });
  }

  /**
   * Get step data for a date range
   */
  static async getSteps(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return prisma.stepData.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get today's step data
   */
  static async getTodaySteps(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stepData = await prisma.stepData.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // Get user's step goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true },
    });

    return {
      data: stepData || {
        steps: 0,
        distance: 0,
        calories: 0,
        activeMinutes: 0,
        source: 'none',
      },
      goal: user?.stepGoal || 10000,
      goalReached: stepData ? stepData.steps >= (user?.stepGoal || 10000) : false,
      progressPercentage: stepData
        ? Math.min(100, Math.round((stepData.steps / (user?.stepGoal || 10000)) * 100))
        : 0,
    };
  }

  /**
   * Get step statistics for user
   */
  static async getStats(userId: string): Promise<StepStats> {
    const allSteps = await prisma.stepData.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (allSteps.length === 0) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        totalActiveMinutes: 0,
        averageSteps: 0,
        averageDistance: 0,
        bestDay: null,
        currentStreak: 0,
        longestStreak: 0,
        daysTracked: 0,
        goalAchievedDays: 0,
      };
    }

    // Get user's step goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true },
    });
    const stepGoal = user?.stepGoal || 10000;

    // Calculate totals
    const totalSteps = allSteps.reduce((sum, s) => sum + s.steps, 0);
    const totalDistance = allSteps.reduce((sum, s) => sum + s.distance, 0);
    const totalCalories = allSteps.reduce((sum, s) => sum + (s.calories || 0), 0);
    const totalActiveMinutes = allSteps.reduce(
      (sum, s) => sum + (s.activeMinutes || 0),
      0
    );

    // Find best day
    const bestDay = allSteps.reduce(
      (best, current) =>
        current.steps > (best?.steps || 0) ? current : best,
      allSteps[0]
    );

    // Calculate streaks
    const { currentStreak, longestStreak, goalAchievedDays } =
      this.calculateStreaks(allSteps, stepGoal);

    return {
      totalSteps,
      totalDistance,
      totalCalories,
      totalActiveMinutes,
      averageSteps: Math.round(totalSteps / allSteps.length),
      averageDistance: Math.round(totalDistance / allSteps.length),
      bestDay: {
        date: bestDay.date,
        steps: bestDay.steps,
      },
      currentStreak,
      longestStreak,
      daysTracked: allSteps.length,
      goalAchievedDays,
    };
  }

  /**
   * Calculate step streaks
   */
  private static calculateStreaks(
    stepData: { date: Date; steps: number }[],
    stepGoal: number
  ) {
    // Filter days that hit the goal
    const goalDays = stepData.filter((s) => s.steps >= stepGoal);
    const goalAchievedDays = goalDays.length;

    if (goalDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0, goalAchievedDays: 0 };
    }

    // Sort by date descending
    const sortedDays = [...goalDays].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there's recent activity
    const mostRecentDate = new Date(sortedDays[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);

    const hasRecentActivity =
      mostRecentDate.getTime() === today.getTime() ||
      mostRecentDate.getTime() === yesterday.getTime();

    // Calculate streaks
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      const currDate = new Date(sortedDays[i].date);
      currDate.setHours(0, 0, 0, 0);

      const dayDiff =
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    if (hasRecentActivity) {
      // Calculate current streak from most recent day
      currentStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1].date);
        prevDate.setHours(0, 0, 0, 0);
        const currDate = new Date(sortedDays[i].date);
        currDate.setHours(0, 0, 0, 0);

        const dayDiff =
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak, goalAchievedDays };
  }

  /**
   * Update step data for a specific date
   */
  static async updateSteps(
    userId: string,
    date: Date,
    data: Partial<LogStepsInput>
  ) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const existing = await prisma.stepData.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Step data for this date');
    }

    return prisma.stepData.update({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      data: {
        steps: data.steps ?? existing.steps,
        distance: data.distance ?? existing.distance,
        calories: data.calories ?? existing.calories,
        activeMinutes: data.activeMinutes ?? existing.activeMinutes,
        source: data.source ?? existing.source,
      },
    });
  }

  /**
   * Delete step data for a specific date
   */
  static async deleteSteps(userId: string, date: Date): Promise<void> {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const existing = await prisma.stepData.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Step data for this date');
    }

    await prisma.stepData.delete({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
    });
  }

  /**
   * Get weekly step data (last 7 days)
   */
  static async getWeeklySteps(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const stepData = await this.getSteps(userId, startDate, endDate);

    // Fill in missing days with zeros
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dayData = stepData.find((s) => {
        const sDate = new Date(s.date);
        sDate.setHours(0, 0, 0, 0);
        return sDate.getTime() === date.getTime();
      });

      result.push({
        date,
        steps: dayData?.steps || 0,
        distance: dayData?.distance || 0,
        calories: dayData?.calories || 0,
        activeMinutes: dayData?.activeMinutes || 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    return result;
  }

  /**
   * Get monthly step summary
   */
  static async getMonthlySteps(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const stepData = await this.getSteps(userId, startDate, endDate);

    const totalSteps = stepData.reduce((sum, s) => sum + s.steps, 0);
    const totalDistance = stepData.reduce((sum, s) => sum + s.distance, 0);
    const daysWithData = stepData.length;
    const averageSteps = daysWithData > 0 ? Math.round(totalSteps / daysWithData) : 0;

    // Get user goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true },
    });
    const stepGoal = user?.stepGoal || 10000;
    const daysGoalMet = stepData.filter((s) => s.steps >= stepGoal).length;

    return {
      year,
      month,
      totalSteps,
      totalDistance,
      averageSteps,
      daysWithData,
      daysGoalMet,
      goalMetPercentage:
        daysWithData > 0 ? Math.round((daysGoalMet / daysWithData) * 100) : 0,
      dailyData: stepData,
    };
  }
}
