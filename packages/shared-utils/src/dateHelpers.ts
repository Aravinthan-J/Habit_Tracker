/**
 * Date utility functions for habit tracking
 */

/**
 * Format date to YYYY-MM-DD string
 *
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date at midnight (00:00:00)
 *
 * @returns Today's date
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get all dates in a specific month
 *
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @returns Array of dates in the month
 */
export const getMonthDates = (year: number, month: number): Date[] => {
  const dates: Date[] = [];
  const daysInMonth = getDaysInMonth(year, month);

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month - 1, day));
  }

  return dates;
};

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getToday();
  return formatDate(d) === formatDate(today);
};

/**
 * Check if two dates are the same day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export const isSameDay = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  return formatDate(date1) === formatDate(date2);
};

/**
 * Get number of days in a month
 *
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @returns Number of days in the month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get month name from month number
 *
 * @param month - Month (1-12)
 * @param short - Use short format (e.g., "Jan" vs "January")
 * @returns Month name
 */
export const getMonthName = (month: number, short: boolean = false): string => {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: short ? 'short' : 'long',
  });
};

/**
 * Add days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Subtract days from a date
 *
 * @param date - Starting date
 * @param days - Number of days to subtract
 * @returns New date
 */
export const subtractDays = (date: Date | string, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Get number of days between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates (absolute value)
 */
export const daysBetween = (
  date1: Date | string,
  date2: Date | string
): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get start and end dates of a week
 *
 * @param date - Any date in the week
 * @returns Object with start and end dates
 */
export const getWeekRange = (
  date: Date | string
): { start: Date; end: Date } => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day); // Sunday
  const end = new Date(d);
  end.setDate(d.getDate() + (6 - day)); // Saturday
  return { start, end };
};

/**
 * Get start and end dates of a month
 *
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @returns Object with start and end dates
 */
export const getMonthRange = (
  year: number,
  month: number
): { start: Date; end: Date } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // Last day of month
  return { start, end };
};
