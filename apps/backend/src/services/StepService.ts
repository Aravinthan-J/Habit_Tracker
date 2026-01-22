/**
 * Step Service
 * Handles step data tracking and statistics
 */

import { PrismaClient, StepData } from '@prisma/client';

const prisma = new PrismaClient();

interface StepStats {
  totalSteps: number;
  totalDistance: number;
  averageStepsPerDay: number;
  bestDay: {
    date: string;
    steps: number;
  } | null;
  currentStreak: number;
  longestStreak: number;
  daysWithGoal: number;
}

export class StepService {
  /**
   * Save/update step data for a date
   */
  static async logSteps(
    userId: string,
    date: string,
    steps: number,
    distance: number,
    calories?: number,
    activeMinutes?: number,
    source: string = 'manual'
  ): Promise<StepData> {
    const dateObj = new Date(date);

    return await prisma.stepData.upsert({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      update: {
        steps,
        distance,
        calories,
        activeMinutes,
        source,
      },
      create: {
        userId,
        date: dateObj,
        steps,
        distance,
        calories,
        activeMinutes,
        source,
      },
    });
  }

  /**
   * Get step data for date range
   */
  static async getSteps(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<StepData[]> {
    return await prisma.stepData.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Get today's steps
   */
  static async getTodaySteps(userId: string): Promise<StepData | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.stepData.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  /**
   * Calculate step statistics
   */
  static async getStats(userId: string): Promise<StepStats> {
    const allStepData = await prisma.stepData.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (allStepData.length === 0) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        averageStepsPerDay: 0,
        bestDay: null,
        currentStreak: 0,
        longestStreak: 0,
        daysWithGoal: 0,
      };
    }

    // Get user's step goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true },
    });

    const stepGoal = user?.stepGoal || 10000;

    // Calculate totals
    const totalSteps = allStepData.reduce((sum, data) => sum + data.steps, 0);
    const totalDistance = allStepData.reduce((sum, data) => sum + data.distance, 0);
    const averageStepsPerDay = Math.round(totalSteps / allStepData.length);

    // Find best day
    const bestDayData = allStepData.reduce((best, current) =>
      current.steps > best.steps ? current : best
    );

    const bestDay = {
      date: bestDayData.date.toISOString().split('T')[0],
      steps: bestDayData.steps,
    };

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(allStepData, stepGoal);

    // Calculate longest streak
    const longestStreak = this.calculateLongestStreak(allStepData, stepGoal);

    // Count days with goal met
    const daysWithGoal = allStepData.filter((data) => data.steps >= stepGoal).length;

    return {
      totalSteps,
      totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
      averageStepsPerDay,
      bestDay,
      currentStreak,
      longestStreak,
      daysWithGoal,
    };
  }

  /**
   * Calculate current streak (consecutive days hitting goal)
   */
  private static calculateCurrentStreak(stepData: StepData[], goalSteps: number): number {
    if (stepData.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort by date descending
    const sortedData = [...stepData].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Check if today or yesterday has data (allow for today not being complete yet)
    const latestDate = new Date(sortedData[0].date);
    latestDate.setHours(0, 0, 0, 0);

    const daysSinceLatest = Math.floor(
      (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLatest > 1) return 0; // Streak broken

    // Count consecutive days hitting goal
    for (let i = 0; i < sortedData.length; i++) {
      const data = sortedData[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      const dataDate = new Date(data.date);
      dataDate.setHours(0, 0, 0, 0);

      if (
        dataDate.getTime() === expectedDate.getTime() &&
        data.steps >= goalSteps
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak ever
   */
  private static calculateLongestStreak(stepData: StepData[], goalSteps: number): number {
    if (stepData.length === 0) return 0;

    // Sort by date ascending
    const sortedData = [...stepData].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const data of sortedData) {
      if (data.steps < goalSteps) {
        currentStreak = 0;
        lastDate = null;
        continue;
      }

      const currentDate = new Date(data.date);
      currentDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        currentStreak = 1;
      } else {
        const expectedDate = new Date(lastDate);
        expectedDate.setDate(expectedDate.getDate() + 1);

        if (currentDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = currentDate;
    }

    return maxStreak;
  }

  /**
   * Get step goal for user
   */
  static async getStepGoal(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true },
    });

    return user?.stepGoal || 10000;
  }

  /**
   * Update step goal for user
   */
  static async updateStepGoal(userId: string, stepGoal: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { stepGoal },
    });
  }
}
