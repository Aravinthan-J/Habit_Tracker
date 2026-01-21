/**
 * Completion Service
 * Handles habit completion tracking
 */

import { Completion } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/AppError';

export interface CreateCompletionData {
  habitId: string;
  date: string; // YYYY-MM-DD format
}

export interface CompletionFilters {
  habitId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MonthlyCalendarData {
  date: string;
  habitIds: string[];
}

export class CompletionService {
  /**
   * Mark habit as complete for a specific date (idempotent)
   */
  static async create(
    userId: string,
    data: CreateCompletionData
  ): Promise<Completion> {
    // Verify habit exists and belongs to user
    const habit = await prisma.habit.findUnique({
      where: { id: data.habitId },
    });

    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    if (habit.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Parse date
    const completionDate = new Date(data.date);

    // Upsert completion (create if doesn't exist, return existing if it does)
    const completion = await prisma.completion.upsert({
      where: {
        habitId_date: {
          habitId: data.habitId,
          date: completionDate,
        },
      },
      update: {}, // No update needed if exists
      create: {
        habitId: data.habitId,
        userId,
        date: completionDate,
      },
    });

    return completion;
  }

  /**
   * Unmark habit completion (delete completion record)
   */
  static async delete(
    userId: string,
    habitId: string,
    date: string
  ): Promise<void> {
    // Verify habit belongs to user
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    if (habit.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Parse date
    const completionDate = new Date(date);

    // Delete completion
    await prisma.completion.deleteMany({
      where: {
        habitId,
        date: completionDate,
        userId,
      },
    });
  }

  /**
   * Get completions with optional filters
   */
  static async getAll(
    userId: string,
    filters: CompletionFilters = {}
  ): Promise<Completion[]> {
    const where: any = { userId };

    if (filters.habitId) {
      where.habitId = filters.habitId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};

      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }

      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const completions = await prisma.completion.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        habit: {
          select: {
            id: true,
            title: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return completions;
  }

  /**
   * Get monthly calendar data
   * Returns all completions for a specific month grouped by date
   */
  static async getMonthlyCalendar(
    userId: string,
    year: number,
    month: number // 1-12
  ): Promise<{
    completions: MonthlyCalendarData[];
    habits: Array<{ id: string; title: string; color: string; icon: string | null }>;
  }> {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS
    const endDate = new Date(year, month, 0); // Last day of month

    // Get all user's habits
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      select: {
        id: true,
        title: true,
        color: true,
        icon: true,
      },
    });

    // Get all completions for the month
    const completions = await prisma.completion.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Group completions by date
    const completionsByDate = new Map<string, string[]>();

    completions.forEach((completion) => {
      const dateStr = completion.date.toISOString().split('T')[0];

      if (!completionsByDate.has(dateStr)) {
        completionsByDate.set(dateStr, []);
      }

      completionsByDate.get(dateStr)!.push(completion.habitId);
    });

    // Convert to array format
    const completionsArray: MonthlyCalendarData[] = Array.from(
      completionsByDate.entries()
    ).map(([date, habitIds]) => ({
      date,
      habitIds,
    }));

    return {
      completions: completionsArray,
      habits,
    };
  }
}
