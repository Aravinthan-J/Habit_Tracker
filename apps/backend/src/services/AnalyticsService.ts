/**
 * Analytics Service
 * Generates insights and statistics about user habits
 */

import { Completion, Habit } from '@habit-tracker/shared-types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OverviewStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  averageCompletionRate: number;
  currentStreaks: number;
  totalBadges: number;
}

interface TrendData {
  date: string;
  completionRate: number;
  completedCount: number;
  totalHabits: number;
}

interface Insight {
  type: string;
  message: string;
  icon: string;
  priority: number;
}

export class AnalyticsService {
  /**
   * Get overview statistics
   */
  static async getOverview(userId: string): Promise<OverviewStats> {
    // Get all habits
    const allHabits = await prisma.habit.findMany({
      where: { userId },
    });

    // Get active habits
    const activeHabits = allHabits.filter((h: Habit) => !h.archivedAt);

    // Get total completions
    const totalCompletions = await prisma.completion.count({
      where: { userId },
    });

    // Calculate average completion rate for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = now.getDate();

    let totalPossibleCompletions = 0;
    let actualCompletions = 0;

    for (const habit of activeHabits) {
      const habitCompletions = await prisma.completion.count({
        where: {
          habitId: habit.id,
          date: {
            gte: firstDayOfMonth,
          },
        },
      });
      actualCompletions += habitCompletions;
      totalPossibleCompletions += daysInMonth;
    }

    const averageCompletionRate =
      totalPossibleCompletions > 0
        ? Math.round((actualCompletions / totalPossibleCompletions) * 100)
        : 0;

    // Count current streaks
    let currentStreaks = 0;
    for (const habit of activeHabits) {
      const streak = await this.calculateHabitStreak(habit.id);
      if (streak > 0) currentStreaks++;
    }

    // Get total badges
    const totalBadges = await prisma.userBadge.count({
      where: { userId },
    });

    return {
      totalHabits: allHabits.length,
      activeHabits: activeHabits.length,
      totalCompletions,
      averageCompletionRate,
      currentStreaks,
      totalBadges,
    };
  }

  /**
   * Get completion trends over time
   */
  static async getTrends(userId: string, days: number = 30): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    const today = new Date();

    // Get active habits count for normalization
    const activeHabits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
    });

    const totalHabits = activeHabits.length;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get completions for this day
      const completions = await prisma.completion.count({
        where: {
          userId,
          date: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      const completionRate =
        totalHabits > 0 ? Math.round((completions / totalHabits) * 100) : 0;

      trends.push({
        date: date.toISOString().split('T')[0],
        completionRate,
        completedCount: completions,
        totalHabits,
      });
    }

    return trends;
  }

  /**
   * Generate AI-like insights
   */
  static async generateInsights(userId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Insight 1: Best day of week
    const bestDay = await this.calculateBestDayOfWeek(userId);
    if (bestDay.rate > 0) {
      insights.push({
        type: 'best_day',
        message: `Your best day is ${bestDay.name} with ${bestDay.rate}% completion rate`,
        icon: 'trophy',
        priority: 1,
      });
    }

    // Insight 2: Longest streak
    const longestStreak = await this.getLongestStreak(userId);
    if (longestStreak.days > 7) {
      insights.push({
        type: 'streak',
        message: `Amazing! You maintained a ${longestStreak.days}-day streak on "${longestStreak.habitName}" 🔥`,
        icon: 'fire',
        priority: 2,
      });
    }

    // Insight 3: Month-over-month improvement
    const improvement = await this.calculateMonthlyImprovement(userId);
    if (improvement > 5) {
      insights.push({
        type: 'improvement',
        message: `Your completion rate increased ${improvement}% this month!`,
        icon: 'trending-up',
        priority: 3,
      });
    } else if (improvement < -5) {
      insights.push({
        type: 'decline',
        message: `Your completion rate dropped ${Math.abs(improvement)}% this month. Keep going!`,
        icon: 'trending-down',
        priority: 3,
      });
    }

    // Insight 4: Most consistent habit
    const mostConsistent = await this.getMostConsistentHabit(userId);
    if (mostConsistent.rate > 80) {
      insights.push({
        type: 'consistency',
        message: `"${mostConsistent.habitName}" is your most consistent habit at ${mostConsistent.rate}% completion`,
        icon: 'check-circle',
        priority: 4,
      });
    }

    // Insight 5: Total completion milestone
    const totalCompletions = await prisma.completion.count({
      where: { userId },
    });
    if (totalCompletions >= 100 && totalCompletions % 100 === 0) {
      insights.push({
        type: 'milestone',
        message: `Congratulations! You've completed ${totalCompletions} habits total! 🎉`,
        icon: 'star',
        priority: 0,
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate best day of week
   */
  private static async calculateBestDayOfWeek(
    userId: string
  ): Promise<{ name: string; rate: number }> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats: { [key: number]: { completed: number; total: number } } = {};

    // Initialize day stats
    for (let i = 0; i < 7; i++) {
      dayStats[i] = { completed: 0, total: 0 };
    }

    // Get last 30 days of completions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completions = await prisma.completion.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      select: { date: true },
    });

    // Get active habits count
    const activeHabitsCount = await prisma.habit.count({
      where: { userId, archivedAt: null },
    });

    // Count completions by day of week
    completions.forEach((comp: Completion) => {
      const day = new Date(comp.date).getDay();
      dayStats[day].completed++;
    });

    // Calculate totals (number of occurrences of each day in last 30 days * active habits)
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.getDay();
      dayStats[day].total += activeHabitsCount;
    }

    // Find best day
    let bestDay = 0;
    let bestRate = 0;

    Object.keys(dayStats).forEach((dayKey) => {
      const day = parseInt(dayKey);
      const rate =
        dayStats[day].total > 0
          ? Math.round((dayStats[day].completed / dayStats[day].total) * 100)
          : 0;

      if (rate > bestRate) {
        bestRate = rate;
        bestDay = day;
      }
    });

    return {
      name: dayNames[bestDay],
      rate: bestRate,
    };
  }

  /**
   * Get longest streak across all habits
   */
  private static async getLongestStreak(
    userId: string
  ): Promise<{ days: number; habitName: string }> {
    const habits = await prisma.habit.findMany({
      where: { userId },
    });

    let longestStreak = 0;
    let habitName = '';

    for (const habit of habits) {
      const streak = await this.calculateMaxStreak(habit.id);
      if (streak > longestStreak) {
        longestStreak = streak;
        habitName = habit.title;
      }
    }

    return { days: longestStreak, habitName };
  }

  /**
   * Calculate maximum streak ever for a habit
   */
  private static async calculateMaxStreak(habitId: string): Promise<number> {
    const completions = await prisma.completion.findMany({
      where: { habitId },
      orderBy: { date: 'asc' },
      select: { date: true },
    });

    if (completions.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completions.length; i++) {
      const prevDate = new Date(completions[i - 1].date);
      const currDate = new Date(completions[i].date);

      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
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

    const lastCompletion = new Date(completions[0].date);
    lastCompletion.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 1) return 0; // Streak broken

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
   * Calculate month-over-month improvement
   */
  private static async calculateMonthlyImprovement(userId: string): Promise<number> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get active habits
    const activeHabitsCount = await prisma.habit.count({
      where: { userId, archivedAt: null },
    });

    if (activeHabitsCount === 0) return 0;

    // Current month completions
    const currentMonthCompletions = await prisma.completion.count({
      where: {
        userId,
        date: { gte: currentMonthStart },
      },
    });

    const currentMonthDays = now.getDate();
    const currentRate =
      (currentMonthCompletions / (currentMonthDays * activeHabitsCount)) * 100;

    // Last month completions
    const lastMonthCompletions = await prisma.completion.count({
      where: {
        userId,
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    const lastMonthDays = lastMonthEnd.getDate();
    const lastRate = (lastMonthCompletions / (lastMonthDays * activeHabitsCount)) * 100;

    return Math.round(currentRate - lastRate);
  }

  /**
   * Get most consistent habit
   */
  private static async getMostConsistentHabit(
    userId: string
  ): Promise<{ habitName: string; rate: number }> {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
    });

    let bestHabit = '';
    let bestRate = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const habit of habits) {
      const completions = await prisma.completion.count({
        where: {
          habitId: habit.id,
          date: { gte: thirtyDaysAgo },
        },
      });

      const rate = Math.round((completions / 30) * 100);

      if (rate > bestRate) {
        bestRate = rate;
        bestHabit = habit.title;
      }
    }

    return { habitName: bestHabit, rate: bestRate };
  }
}
