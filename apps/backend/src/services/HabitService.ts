/**
 * Habit Service
 * Handles CRUD operations for habits
 */

import { Habit } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/AppError';

export interface CreateHabitData {
  title: string;
  monthlyGoal: number;
  color?: string;
  icon?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
}

export interface UpdateHabitData {
  title?: string;
  monthlyGoal?: number;
  color?: string;
  icon?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
}

export class HabitService {
  /**
   * Create a new habit
   */
  static async create(userId: string, data: CreateHabitData): Promise<Habit> {
    const habit = await prisma.habit.create({
      data: {
        userId,
        title: data.title,
        monthlyGoal: data.monthlyGoal,
        color: data.color || '#6C63FF',
        icon: data.icon || null,
        notificationsEnabled: data.notificationsEnabled || false,
        reminderTime: data.reminderTime || null,
      },
    });

    return habit;
  }

  /**
   * Get all user habits (optionally include archived)
   */
  static async getAll(userId: string, includeArchived: boolean = false): Promise<Habit[]> {
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return habits;
  }

  /**
   * Get single habit by ID
   */
  static async getById(habitId: string, userId: string): Promise<Habit> {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    // Verify ownership
    if (habit.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return habit;
  }

  /**
   * Update habit
   */
  static async update(
    habitId: string,
    userId: string,
    data: UpdateHabitData
  ): Promise<Habit> {
    // Verify ownership
    await this.getById(habitId, userId);

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data,
    });

    return habit;
  }

  /**
   * Delete habit (soft delete)
   */
  static async delete(habitId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getById(habitId, userId);

    await prisma.habit.update({
      where: { id: habitId },
      data: {
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Get habit statistics
   */
  static async getStats(habitId: string, userId: string): Promise<HabitStats> {
    // Verify ownership
    await this.getById(habitId, userId);

    // Get all completions for this habit
    const completions = await prisma.completion.findMany({
      where: { habitId },
      orderBy: { date: 'asc' },
      select: { date: true },
    });

    // Convert dates to strings for calculations
    const completionDates = completions.map((c) =>
      c.date.toISOString().split('T')[0]
    );

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(completionDates);

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletions = completions.filter(
      (c) => c.date >= thirtyDaysAgo
    ).length;

    const completionRate = recentCompletions > 0
      ? Math.round((recentCompletions / 30) * 100)
      : 0;

    return {
      currentStreak,
      longestStreak,
      completionRate,
      totalCompletions: completions.length,
    };
  }

  /**
   * Calculate current and longest streak from completion dates
   */
  private static calculateStreaks(dates: string[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Sort dates in descending order
    const sortedDates = [...dates].sort().reverse();

    // Calculate current streak
    if (sortedDates[0] === today || sortedDates[0] === yesterdayStr) {
      currentStreak = 1;
      let prevDate = new Date(sortedDates[0]);

      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const dayDiff = Math.floor(
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          currentStreak++;
          prevDate = currentDate;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currentDate = new Date(dates[i]);
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }
}
