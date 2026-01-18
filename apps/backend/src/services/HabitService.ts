import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import {
  CreateHabitInput,
  UpdateHabitInput,
} from '../validators/habit.validator';

/**
 * Habit with stats
 */
export interface HabitWithStats {
  id: string;
  userId: string;
  title: string;
  monthlyGoal: number;
  color: string;
  icon: string;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
}

/**
 * Service for handling habit operations
 */
export class HabitService {
  /**
   * Create a new habit
   *
   * @param userId - User ID
   * @param data - Habit creation data
   * @returns Created habit
   */
  static async create(userId: string, data: CreateHabitInput) {
    const habit = await prisma.habit.create({
      data: {
        ...data,
        userId,
      },
    });

    return habit;
  }

  /**
   * Get all habits for a user
   *
   * @param userId - User ID
   * @param includeArchived - Whether to include archived habits
   * @returns Array of habits
   */
  static async getAll(userId: string, includeArchived: boolean = false) {
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
   * Get a single habit by ID
   *
   * @param habitId - Habit ID
   * @param userId - User ID
   * @returns Habit data
   * @throws NotFoundError if habit not found
   * @throws ForbiddenError if habit doesn't belong to user
   */
  static async getById(habitId: string, userId: string) {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      throw new NotFoundError('Habit');
    }

    if (habit.userId !== userId) {
      throw new ForbiddenError('Access denied to this habit');
    }

    return habit;
  }

  /**
   * Update a habit
   *
   * @param habitId - Habit ID
   * @param userId - User ID
   * @param data - Update data
   * @returns Updated habit
   * @throws NotFoundError if habit not found
   * @throws ForbiddenError if habit doesn't belong to user
   */
  static async update(
    habitId: string,
    userId: string,
    data: UpdateHabitInput
  ) {
    // Verify ownership
    await this.getById(habitId, userId);

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data,
    });

    return habit;
  }

  /**
   * Delete (archive) a habit
   *
   * @param habitId - Habit ID
   * @param userId - User ID
   * @throws NotFoundError if habit not found
   * @throws ForbiddenError if habit doesn't belong to user
   */
  static async delete(habitId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getById(habitId, userId);

    // Soft delete by setting archivedAt
    await prisma.habit.update({
      where: { id: habitId },
      data: { archivedAt: new Date() },
    });
  }

  /**
   * Get habit statistics including streaks and completion rate
   *
   * @param habitId - Habit ID
   * @param userId - User ID
   * @returns Habit with calculated stats
   */
  static async getStats(habitId: string, userId: string): Promise<HabitWithStats> {
    // Verify ownership and get habit
    const habit = await this.getById(habitId, userId);

    // Get all completions for this habit, ordered by date
    const completions = await prisma.completion.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    // Calculate stats
    const { currentStreak, longestStreak } = this.calculateStreaks(
      completions.map((c) => c.date)
    );
    const totalCompletions = completions.length;
    const completionRate = this.calculateCompletionRate(
      completions.map((c) => c.date),
      habit.createdAt
    );

    return {
      ...habit,
      currentStreak,
      longestStreak,
      completionRate,
      totalCompletions,
    };
  }

  /**
   * Calculate current and longest streaks from completion dates
   *
   * @param dates - Array of completion dates (should be sorted descending)
   * @returns Current and longest streak counts
   */
  private static calculateStreaks(dates: Date[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert dates to comparable format (YYYY-MM-DD)
    const dateStrings = dates.map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    // Check if there's a completion today or yesterday to start current streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreakActive = false;

    if (
      dateStrings.includes(today.getTime()) ||
      dateStrings.includes(yesterday.getTime())
    ) {
      currentStreakActive = true;
    }

    // Calculate streaks
    let expectedDate = dateStrings[0];

    for (let i = 0; i < dateStrings.length; i++) {
      const currentDate = dateStrings[i];

      if (i === 0 || currentDate === expectedDate) {
        tempStreak++;

        // Update current streak if still active
        if (currentStreakActive && currentStreak === 0) {
          currentStreak = tempStreak;
        }
      } else {
        // Streak broken
        longestStreak = Math.max(longestStreak, tempStreak);

        // Check if this is the start of current streak
        if (currentStreakActive && currentStreak === 0) {
          currentStreakActive = false;
        }

        tempStreak = 1; // Start new streak
      }

      // Prepare expected date for next iteration (one day before current)
      const nextExpectedDate = new Date(currentDate);
      nextExpectedDate.setDate(nextExpectedDate.getDate() - 1);
      expectedDate = nextExpectedDate.getTime();
    }

    // Update longest streak with final temp streak
    longestStreak = Math.max(longestStreak, tempStreak);

    // If current streak wasn't set but should be
    if (currentStreakActive && currentStreak === 0) {
      currentStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate completion rate since habit creation
   *
   * @param completionDates - Array of completion dates
   * @param createdAt - Habit creation date
   * @returns Completion rate as percentage (0-100)
   */
  private static calculateCompletionRate(
    completionDates: Date[],
    createdAt: Date
  ): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(createdAt);
    startDate.setHours(0, 0, 0, 0);

    // Calculate days since creation (inclusive)
    const daysSinceCreation =
      Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysSinceCreation <= 0) {
      return 0;
    }

    const completionCount = completionDates.length;
    const rate = (completionCount / daysSinceCreation) * 100;

    return Math.round(rate * 100) / 100; // Round to 2 decimal places
  }
}
