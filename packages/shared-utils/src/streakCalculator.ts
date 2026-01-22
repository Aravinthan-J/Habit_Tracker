/**
 * Streak Calculator
 * Functions to calculate habit streaks and completion rates
 */

import { differenceInDays } from 'date-fns';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate current and longest streak from completion dates
 * @param dates Array of completion dates (YYYY-MM-DD format)
 * @returns Current streak and longest streak
 */
export function calculateStreak(dates: string[]): StreakResult {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort dates in descending order (newest first)
  const sortedDates = [...dates].sort().reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Calculate current streak
  // Streak is valid if most recent completion is today or yesterday
  if (sortedDates[0] === today || sortedDates[0] === yesterdayStr) {
    currentStreak = 1;
    let prevDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const dayDiff = differenceInDays(prevDate, currentDate);

      if (dayDiff === 1) {
        currentStreak++;
        prevDate = currentDate;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  // Sort dates in ascending order for this calculation
  const ascendingDates = [...dates].sort();

  for (let i = 1; i < ascendingDates.length; i++) {
    const prevDate = new Date(ascendingDates[i - 1]);
    const currentDate = new Date(ascendingDates[i]);
    const dayDiff = differenceInDays(currentDate, prevDate);

    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Account for single completion or first completion in streak
  longestStreak = Math.max(longestStreak, 1);

  return { currentStreak, longestStreak };
}

/**
 * Calculate completion rate (percentage)
 * @param completedCount Number of completions
 * @param totalCount Total possible completions
 * @returns Percentage (0-100)
 */
export function calculateCompletionRate(
  completedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

/**
 * Calculate monthly progress
 * @param completedDays Number of days completed this month
 * @param monthlyGoal Target days for the month
 * @returns Progress percentage and status
 */
export function calculateMonthlyProgress(
  completedDays: number,
  monthlyGoal: number
): {
  completedDays: number;
  totalDays: number;
  percentage: number;
  isOnTrack: boolean;
  daysRemaining: number;
} {
  const percentage = calculateCompletionRate(completedDays, monthlyGoal);
  const daysRemaining = monthlyGoal - completedDays;

  // Calculate if on track (completed at least as many days as we should have by now)
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const expectedCompletions = Math.floor((dayOfMonth / daysInMonth) * monthlyGoal);
  const isOnTrack = completedDays >= expectedCompletions;

  return {
    completedDays,
    totalDays: monthlyGoal,
    percentage,
    isOnTrack,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

/**
 * Check if a date is part of a streak
 * @param date Date to check
 * @param completionDates Array of completion dates
 * @returns True if date is part of a streak
 */
export function isDateInStreak(date: string, completionDates: string[]): boolean {
  if (!completionDates.includes(date)) return false;

  const dateObj = new Date(date);
  const yesterday = new Date(dateObj);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date(dateObj);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Check if previous or next day is also completed
  return (
    completionDates.includes(yesterdayStr) || completionDates.includes(tomorrowStr)
  );
}

/**
 * Get streak milestones (e.g., 7, 14, 21, 30, 60, 90, 100 days)
 */
export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 100, 180, 365];

/**
 * Get next milestone for current streak
 * @param currentStreak Current streak count
 * @returns Next milestone number or null if achieved highest
 */
export function getNextMilestone(currentStreak: number): number | null {
  const nextMilestone = STREAK_MILESTONES.find((m) => m > currentStreak);
  return nextMilestone || null;
}

/**
 * Check if streak reached a milestone
 * @param streak Current streak
 * @returns Milestone number if reached, null otherwise
 */
export function checkMilestone(streak: number): number | null {
  return STREAK_MILESTONES.includes(streak) ? streak : null;
}
