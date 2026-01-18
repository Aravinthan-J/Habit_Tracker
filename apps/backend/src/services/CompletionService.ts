import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { CreateCompletionInput } from '../validators/completion.validator';

/**
 * Monthly calendar data structure
 */
export interface MonthlyCalendarDay {
  date: string;
  completions: Array<{
    id: string;
    habitId: string;
    habitTitle: string;
    habitColor: string;
    habitIcon: string;
  }>;
}

/**
 * Service for handling habit completion operations
 */
export class CompletionService {
  /**
   * Mark a habit as complete for a specific date (idempotent)
   *
   * @param userId - User ID
   * @param data - Completion data (habitId, date)
   * @returns Created or existing completion
   * @throws NotFoundError if habit not found
   * @throws ForbiddenError if habit doesn't belong to user
   */
  static async create(userId: string, data: CreateCompletionInput) {
    const { habitId, date } = data;

    // Verify habit exists and belongs to user
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      throw new NotFoundError('Habit');
    }

    if (habit.userId !== userId) {
      throw new ForbiddenError('Access denied to this habit');
    }

    // Check if habit is archived
    if (habit.archivedAt) {
      throw new ForbiddenError('Cannot mark archived habit as complete');
    }

    // Parse date string to Date object
    const completionDate = new Date(date);

    // Use upsert to make operation idempotent
    const completion = await prisma.completion.upsert({
      where: {
        habitId_date: {
          habitId,
          date: completionDate,
        },
      },
      update: {
        completedAt: new Date(), // Update timestamp if already exists
      },
      create: {
        habitId,
        userId,
        date: completionDate,
      },
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

    return completion;
  }

  /**
   * Unmark a habit completion
   *
   * @param userId - User ID
   * @param habitId - Habit ID
   * @param date - Date string (YYYY-MM-DD)
   * @throws NotFoundError if completion not found
   * @throws ForbiddenError if completion doesn't belong to user
   */
  static async delete(
    userId: string,
    habitId: string,
    date: string
  ): Promise<void> {
    // Parse date string
    const completionDate = new Date(date);

    // Find completion
    const completion = await prisma.completion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: completionDate,
        },
      },
    });

    if (!completion) {
      throw new NotFoundError('Completion');
    }

    if (completion.userId !== userId) {
      throw new ForbiddenError('Access denied to this completion');
    }

    // Delete completion
    await prisma.completion.delete({
      where: {
        habitId_date: {
          habitId,
          date: completionDate,
        },
      },
    });
  }

  /**
   * Get completions with optional filters
   *
   * @param userId - User ID
   * @param filters - Optional filters (habitId, startDate, endDate)
   * @returns Array of completions
   */
  static async getAll(
    userId: string,
    filters?: {
      habitId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const where: any = { userId };

    if (filters?.habitId) {
      where.habitId = filters.habitId;
    }

    if (filters?.startDate || filters?.endDate) {
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
      orderBy: {
        date: 'desc',
      },
    });

    return completions;
  }

  /**
   * Get monthly calendar view with all completions
   *
   * @param userId - User ID
   * @param year - Year (YYYY)
   * @param month - Month (1-12)
   * @returns Array of days with completions
   */
  static async getMonthlyCalendar(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthlyCalendarDay[]> {
    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1); // month - 1 because JS months are 0-indexed
    const endDate = new Date(year, month, 0); // Day 0 of next month = last day of current month

    // Get all completions for the month
    const completions = await prisma.completion.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
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
      orderBy: {
        date: 'asc',
      },
    });

    // Group completions by date
    const calendarMap = new Map<string, MonthlyCalendarDay>();

    // Initialize all days in the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];

      calendarMap.set(dateString, {
        date: dateString,
        completions: [],
      });
    }

    // Add completions to their respective days
    for (const completion of completions) {
      const dateString = completion.date.toISOString().split('T')[0];
      const day = calendarMap.get(dateString);

      if (day) {
        day.completions.push({
          id: completion.id,
          habitId: completion.habitId,
          habitTitle: completion.habit.title,
          habitColor: completion.habit.color,
          habitIcon: completion.habit.icon,
        });
      }
    }

    // Convert map to array
    return Array.from(calendarMap.values());
  }
}
