import { formatDate, getToday, subtractDays } from './dateHelpers';

/**
 * Streak calculation result
 */
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate current and longest streaks from completion dates
 *
 * @param completionDates - Array of completion dates (Date or string)
 * @returns Current and longest streak counts
 */
export const calculateStreak = (
  completionDates: (Date | string)[]
): StreakResult => {
  if (completionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert all dates to YYYY-MM-DD strings and sort descending
  const dateStrings = completionDates
    .map((d) => formatDate(d))
    .sort((a, b) => b.localeCompare(a)); // Descending order

  // Remove duplicates
  const uniqueDates = Array.from(new Set(dateStrings));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = formatDate(getToday());
  const yesterday = formatDate(subtractDays(getToday(), 1));

  // Check if streak is active (completed today or yesterday)
  const isStreakActive =
    uniqueDates.includes(today) || uniqueDates.includes(yesterday);

  // Calculate streaks
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);

      // Calculate days difference
      const diffTime = previousDate.getTime() - currentDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        tempStreak++;
      } else {
        // Streak broken
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    // Set current streak if this is the active streak
    if (isStreakActive && i === 0) {
      currentStreak = tempStreak;
    } else if (isStreakActive && currentStreak > 0) {
      currentStreak = tempStreak;
    }
  }

  // Update longest streak with final temp streak
  longestStreak = Math.max(longestStreak, tempStreak);

  // If streak is not active, current streak is 0
  if (!isStreakActive) {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak };
};

/**
 * Calculate completion rate over a period
 *
 * @param completionDates - Array of completion dates
 * @param startDate - Start date of period
 * @param endDate - End date of period (defaults to today)
 * @returns Completion rate as percentage (0-100)
 */
export const calculateCompletionRate = (
  completionDates: (Date | string)[],
  startDate: Date | string,
  endDate: Date | string = getToday()
): number => {
  const start = new Date(formatDate(startDate));
  const end = new Date(formatDate(endDate));

  // Calculate total days in period
  const diffTime = end.getTime() - start.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays <= 0) {
    return 0;
  }

  // Count completions within period
  const completionsInPeriod = completionDates.filter((date) => {
    const d = new Date(formatDate(date));
    return d >= start && d <= end;
  }).length;

  const rate = (completionsInPeriod / totalDays) * 100;
  return Math.round(rate * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate monthly progress
 *
 * @param completionDates - Array of completion dates
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @param monthlyGoal - Target completions for the month
 * @returns Monthly progress data
 */
export const calculateMonthlyProgress = (
  completionDates: (Date | string)[],
  year: number,
  month: number,
  monthlyGoal: number
): {
  completedDays: number;
  goalDays: number;
  percentage: number;
  remaining: number;
} => {
  // Filter completions for the specified month
  const monthCompletions = completionDates.filter((date) => {
    const d = new Date(formatDate(date));
    return d.getFullYear() === year && d.getMonth() === month - 1;
  });

  const completedDays = monthCompletions.length;
  const goalDays = monthlyGoal;
  const percentage = Math.min(
    Math.round((completedDays / goalDays) * 100),
    100
  );
  const remaining = Math.max(goalDays - completedDays, 0);

  return {
    completedDays,
    goalDays,
    percentage,
    remaining,
  };
};

/**
 * Get best streak in a time period
 *
 * @param completionDates - Array of completion dates
 * @param startDate - Start date of period
 * @param endDate - End date of period
 * @returns Longest streak in the period
 */
export const getBestStreakInPeriod = (
  completionDates: (Date | string)[],
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = new Date(formatDate(startDate));
  const end = new Date(formatDate(endDate));

  // Filter dates within period
  const datesInPeriod = completionDates
    .map((d) => formatDate(d))
    .filter((dateStr) => {
      const d = new Date(dateStr);
      return d >= start && d <= end;
    })
    .sort();

  return calculateStreak(datesInPeriod).longestStreak;
};
