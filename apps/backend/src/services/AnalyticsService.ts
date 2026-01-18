import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/AppError';

/**
 * Overview statistics
 */
export interface OverviewStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  completionsThisMonth: number;
  completionRateThisMonth: number;
  completionRateChange: number; // vs last month
  activeStreaks: number;
  longestActiveStreak: number;
  averageCompletionRate: number;
}

/**
 * Habit analytics
 */
export interface HabitAnalytics {
  habitId: string;
  title: string;
  color: string;
  icon: string;
  monthlyGoal: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  completionRateThisMonth: number;
  completionsThisMonth: number;
  bestMonth: { month: string; completions: number } | null;
  worstMonth: { month: string; completions: number } | null;
  averageCompletionsPerMonth: number;
  dayOfWeekStats: { day: string; average: number }[];
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string;
  completions: number;
  totalHabits: number;
  completionRate: number;
}

/**
 * Insight
 */
export interface Insight {
  type: 'achievement' | 'tip' | 'trend' | 'correlation';
  title: string;
  description: string;
  icon: string;
  priority: number;
}

/**
 * Service for analytics operations
 */
export class AnalyticsService {
  /**
   * Get overview statistics for a user
   */
  static async getOverview(userId: string): Promise<OverviewStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get habit counts
    const [totalHabits, activeHabits] = await Promise.all([
      prisma.habit.count({ where: { userId } }),
      prisma.habit.count({ where: { userId, archivedAt: null } }),
    ]);

    // Get completion counts
    const [totalCompletions, completionsThisMonth, completionsLastMonth] =
      await Promise.all([
        prisma.completion.count({ where: { userId } }),
        prisma.completion.count({
          where: { userId, date: { gte: startOfMonth } },
        }),
        prisma.completion.count({
          where: {
            userId,
            date: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
      ]);

    // Calculate completion rates
    const daysThisMonth = now.getDate();
    const daysLastMonth = endOfLastMonth.getDate();

    const maxCompletionsThisMonth = activeHabits * daysThisMonth;
    const maxCompletionsLastMonth = activeHabits * daysLastMonth;

    const completionRateThisMonth =
      maxCompletionsThisMonth > 0
        ? Math.round((completionsThisMonth / maxCompletionsThisMonth) * 100)
        : 0;

    const completionRateLastMonth =
      maxCompletionsLastMonth > 0
        ? Math.round((completionsLastMonth / maxCompletionsLastMonth) * 100)
        : 0;

    const completionRateChange = completionRateThisMonth - completionRateLastMonth;

    // Get streak info
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          select: { date: true },
        },
      },
    });

    let activeStreaks = 0;
    let longestActiveStreak = 0;

    for (const habit of habits) {
      const streak = this.calculateCurrentStreak(
        habit.completions.map((c) => c.date)
      );
      if (streak > 0) {
        activeStreaks++;
        longestActiveStreak = Math.max(longestActiveStreak, streak);
      }
    }

    // Calculate average completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completionsLast30Days = await prisma.completion.count({
      where: { userId, date: { gte: thirtyDaysAgo } },
    });

    const maxCompletions30Days = activeHabits * 30;
    const averageCompletionRate =
      maxCompletions30Days > 0
        ? Math.round((completionsLast30Days / maxCompletions30Days) * 100)
        : 0;

    return {
      totalHabits,
      activeHabits,
      totalCompletions,
      completionsThisMonth,
      completionRateThisMonth,
      completionRateChange,
      activeStreaks,
      longestActiveStreak,
      averageCompletionRate,
    };
  }

  /**
   * Get analytics for a specific habit
   */
  static async getHabitAnalytics(
    habitId: string,
    userId: string
  ): Promise<HabitAnalytics> {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        completions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!habit) {
      throw new NotFoundError('Habit');
    }

    if (habit.userId !== userId) {
      throw new ForbiddenError('Access denied to this habit');
    }

    const completions = habit.completions;
    const completionDates = completions.map((c) => c.date);

    // Calculate streaks
    const currentStreak = this.calculateCurrentStreak(completionDates);
    const longestStreak = this.calculateLongestStreak(completionDates);

    // This month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completionsThisMonth = completions.filter(
      (c) => new Date(c.date) >= startOfMonth
    ).length;

    const daysThisMonth = now.getDate();
    const completionRateThisMonth =
      daysThisMonth > 0
        ? Math.round((completionsThisMonth / daysThisMonth) * 100)
        : 0;

    // Overall completion rate
    const daysSinceCreation = Math.max(
      1,
      Math.ceil(
        (now.getTime() - new Date(habit.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const completionRate = Math.round(
      (completions.length / daysSinceCreation) * 100
    );

    // Monthly breakdown
    const monthlyStats = this.calculateMonthlyStats(completionDates);
    const months = Object.keys(monthlyStats).sort();

    let bestMonth = null;
    let worstMonth = null;
    let totalMonthlyCompletions = 0;

    if (months.length > 0) {
      let bestCount = 0;
      let worstCount = Infinity;

      for (const month of months) {
        const count = monthlyStats[month];
        totalMonthlyCompletions += count;

        if (count > bestCount) {
          bestCount = count;
          bestMonth = { month, completions: count };
        }
        if (count < worstCount) {
          worstCount = count;
          worstMonth = { month, completions: count };
        }
      }
    }

    const averageCompletionsPerMonth =
      months.length > 0
        ? Math.round(totalMonthlyCompletions / months.length)
        : 0;

    // Day of week stats
    const dayOfWeekStats = this.calculateDayOfWeekStats(completionDates);

    return {
      habitId: habit.id,
      title: habit.title,
      color: habit.color,
      icon: habit.icon,
      monthlyGoal: habit.monthlyGoal,
      currentStreak,
      longestStreak,
      totalCompletions: completions.length,
      completionRate,
      completionRateThisMonth,
      completionsThisMonth,
      bestMonth,
      worstMonth,
      averageCompletionsPerMonth,
      dayOfWeekStats,
    };
  }

  /**
   * Get trend data over time
   */
  static async getTrends(
    userId: string,
    period: 'week' | 'month' | '3months' | 'year' = 'month'
  ): Promise<TrendDataPoint[]> {
    const now = new Date();
    let startDate: Date;
    let interval: 'day' | 'week' | 'month';

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        interval = 'day';
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        interval = 'day';
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        interval = 'week';
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        interval = 'month';
        break;
    }

    // Get completions in date range
    const completions = await prisma.completion.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get active habits count
    const activeHabits = await prisma.habit.count({
      where: { userId, archivedAt: null },
    });

    // Group by interval
    const trends: TrendDataPoint[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      let endDate: Date;

      if (interval === 'day') {
        endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (interval === 'week') {
        endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 7);
      } else {
        endDate = new Date(currentDate);
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const periodCompletions = completions.filter((c) => {
        const date = new Date(c.date);
        return date >= currentDate && date < endDate;
      }).length;

      const daysInPeriod = Math.ceil(
        (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const maxCompletions = activeHabits * daysInPeriod;
      const completionRate =
        maxCompletions > 0
          ? Math.round((periodCompletions / maxCompletions) * 100)
          : 0;

      trends.push({
        date: currentDate.toISOString().split('T')[0],
        completions: periodCompletions,
        totalHabits: activeHabits,
        completionRate,
      });

      currentDate.setTime(endDate.getTime());
    }

    return trends;
  }

  /**
   * Generate insights for user
   */
  static async generateInsights(userId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Get user data
    const [habits, completions, stepData] = await Promise.all([
      prisma.habit.findMany({
        where: { userId, archivedAt: null },
        include: {
          completions: {
            orderBy: { date: 'desc' },
          },
        },
      }),
      prisma.completion.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.stepData.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
    ]);

    // Best day analysis
    const dayOfWeekCompletions = this.calculateDayOfWeekStats(
      completions.map((c) => c.date)
    );
    const bestDay = dayOfWeekCompletions.reduce(
      (best, current) => (current.average > best.average ? current : best),
      dayOfWeekCompletions[0]
    );

    if (bestDay && bestDay.average > 0) {
      insights.push({
        type: 'trend',
        title: 'Best Day Performance',
        description: `Your best day is ${bestDay.day} with ${Math.round(bestDay.average * 100)}% average completion rate!`,
        icon: 'calendar',
        priority: 1,
      });
    }

    // Streak insights
    for (const habit of habits) {
      const streak = this.calculateCurrentStreak(
        habit.completions.map((c) => c.date)
      );
      if (streak >= 7) {
        insights.push({
          type: 'achievement',
          title: 'Active Streak',
          description: `You've maintained a ${streak}-day streak on "${habit.title}"! 🔥`,
          icon: 'flame',
          priority: 2,
        });
      }
    }

    // Completion rate trend
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentCompletions = completions.filter(
      (c) => new Date(c.date) >= thirtyDaysAgo
    ).length;
    const previousCompletions = completions.filter(
      (c) => new Date(c.date) >= sixtyDaysAgo && new Date(c.date) < thirtyDaysAgo
    ).length;

    if (recentCompletions > previousCompletions * 1.1) {
      const increase = Math.round(
        ((recentCompletions - previousCompletions) / previousCompletions) * 100
      );
      insights.push({
        type: 'trend',
        title: 'Improvement Trend',
        description: `Your completion rate increased by ${increase}% compared to last month!`,
        icon: 'trending-up',
        priority: 1,
      });
    }

    // Step correlation insight
    if (stepData.length > 7 && completions.length > 7) {
      const correlation = await this.calculateStepCorrelation(userId);
      if (correlation.correlation > 0.3) {
        insights.push({
          type: 'correlation',
          title: 'Activity Correlation',
          description: `On 10K+ step days, you complete ${Math.round(correlation.highStepCompletionRate)}% of your habits compared to ${Math.round(correlation.lowStepCompletionRate)}% on low-step days!`,
          icon: 'fitness',
          priority: 2,
        });
      }
    }

    // Morning/evening person insight
    const completionTimes = completions
      .filter((c) => c.completedAt)
      .map((c) => new Date(c.completedAt).getHours());

    if (completionTimes.length > 10) {
      const morningCount = completionTimes.filter((h) => h < 12).length;
      const eveningCount = completionTimes.filter((h) => h >= 18).length;

      if (morningCount > eveningCount * 1.5) {
        insights.push({
          type: 'tip',
          title: 'Morning Person',
          description: 'You tend to complete habits most consistently in the morning. Schedule important habits early!',
          icon: 'sunny',
          priority: 3,
        });
      } else if (eveningCount > morningCount * 1.5) {
        insights.push({
          type: 'tip',
          title: 'Night Owl',
          description: 'You tend to complete habits most consistently in the evening. Set reminders for later in the day!',
          icon: 'moon',
          priority: 3,
        });
      }
    }

    // Sort by priority and return top insights
    return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
  }

  /**
   * Calculate step vs habits correlation
   */
  static async calculateStepCorrelation(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [stepData, completions, habitCount] = await Promise.all([
      prisma.stepData.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
      }),
      prisma.completion.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
      }),
      prisma.habit.count({
        where: { userId, archivedAt: null },
      }),
    ]);

    if (stepData.length === 0 || completions.length === 0 || habitCount === 0) {
      return {
        correlation: 0,
        highStepCompletionRate: 0,
        lowStepCompletionRate: 0,
      };
    }

    // Group completions by date
    const completionsByDate = new Map<string, number>();
    for (const c of completions) {
      const dateStr = new Date(c.date).toISOString().split('T')[0];
      completionsByDate.set(dateStr, (completionsByDate.get(dateStr) || 0) + 1);
    }

    // Calculate completion rates for high vs low step days
    const stepThreshold = 10000;
    let highStepDays = 0;
    let highStepCompletions = 0;
    let lowStepDays = 0;
    let lowStepCompletions = 0;

    for (const step of stepData) {
      const dateStr = new Date(step.date).toISOString().split('T')[0];
      const dayCompletions = completionsByDate.get(dateStr) || 0;

      if (step.steps >= stepThreshold) {
        highStepDays++;
        highStepCompletions += dayCompletions;
      } else {
        lowStepDays++;
        lowStepCompletions += dayCompletions;
      }
    }

    const highStepCompletionRate =
      highStepDays > 0 ? (highStepCompletions / (highStepDays * habitCount)) * 100 : 0;
    const lowStepCompletionRate =
      lowStepDays > 0 ? (lowStepCompletions / (lowStepDays * habitCount)) * 100 : 0;

    // Simple correlation calculation
    const correlation =
      highStepCompletionRate > 0 && lowStepCompletionRate > 0
        ? (highStepCompletionRate - lowStepCompletionRate) /
          Math.max(highStepCompletionRate, lowStepCompletionRate)
        : 0;

    return {
      correlation,
      highStepCompletionRate,
      lowStepCompletionRate,
      highStepDays,
      lowStepDays,
    };
  }

  /**
   * Get heatmap data for the year
   */
  static async getHeatmapData(userId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    const [completions, habitCount] = await Promise.all([
      prisma.completion.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.habit.count({
        where: { userId, archivedAt: null },
      }),
    ]);

    // Group by date
    const heatmapData: { date: string; count: number; intensity: number }[] = [];
    const completionsByDate = new Map<string, number>();

    for (const c of completions) {
      const dateStr = new Date(c.date).toISOString().split('T')[0];
      completionsByDate.set(dateStr, (completionsByDate.get(dateStr) || 0) + 1);
    }

    // Generate data for each day of the year
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = completionsByDate.get(dateStr) || 0;
      const intensity =
        habitCount > 0 ? Math.min(4, Math.floor((count / habitCount) * 4)) : 0;

      heatmapData.push({
        date: dateStr,
        count,
        intensity,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return heatmapData;
  }

  /**
   * Get top performing habits
   */
  static async getTopHabits(userId: string, limit: number = 5) {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
    });

    const habitsWithStats = habits.map((habit) => {
      const completionRate =
        (habit.completions.length / Math.min(30, habit.monthlyGoal)) * 100;
      const streak = this.calculateCurrentStreak(
        habit.completions.map((c) => c.date)
      );

      return {
        id: habit.id,
        title: habit.title,
        color: habit.color,
        icon: habit.icon,
        completionsThisMonth: habit.completions.length,
        monthlyGoal: habit.monthlyGoal,
        completionRate: Math.round(completionRate),
        currentStreak: streak,
      };
    });

    return habitsWithStats
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, limit);
  }

  // Helper methods

  private static calculateCurrentStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    const sortedDates = [...dates]
      .map((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if streak is active
    if (
      sortedDates[0] !== today.getTime() &&
      sortedDates[0] !== yesterday.getTime()
    ) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i - 1] - sortedDates[i];
      if (diff === 86400000) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    const sortedDates = [...dates]
      .map((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a);

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i - 1] - sortedDates[i];
      if (diff === 86400000) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  private static calculateMonthlyStats(dates: Date[]): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const date of dates) {
      const d = new Date(date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      stats[monthKey] = (stats[monthKey] || 0) + 1;
    }

    return stats;
  }

  private static calculateDayOfWeekStats(
    dates: Date[]
  ): { day: string; average: number }[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const totals = [0, 0, 0, 0, 0, 0, 0];

    for (const date of dates) {
      const d = new Date(date);
      const dayIndex = d.getDay();
      counts[dayIndex]++;
    }

    // Calculate weeks span
    if (dates.length > 0) {
      const sortedDates = [...dates].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      const firstDate = new Date(sortedDates[0]);
      const lastDate = new Date(sortedDates[sortedDates.length - 1]);
      const weeks = Math.max(
        1,
        Math.ceil(
          (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
      );

      for (let i = 0; i < 7; i++) {
        totals[i] = weeks;
      }
    }

    return days.map((day, index) => ({
      day,
      average: totals[index] > 0 ? counts[index] / totals[index] : 0,
    }));
  }
}
