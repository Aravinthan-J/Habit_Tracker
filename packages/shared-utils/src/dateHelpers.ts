/**
 * Date Helper Functions
 * Utilities for date manipulation and formatting
 */

import {
  format,
  isToday as isTodayFn,
  isSameDay as isSameDayFn,
  addDays,
  subDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  getDaysInMonth as getDaysInMonthFn,
  getMonth,
  getYear,
} from 'date-fns';

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Format date to string
 * @param date Date to format
 * @param formatStr Format string (default: 'yyyy-MM-dd')
 */
export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isTodayFn(dateObj);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const date1Obj = typeof date1 === 'string' ? new Date(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? new Date(date2) : date2;
  return isSameDayFn(date1Obj, date2Obj);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addDays(dateObj, days);
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return subDays(dateObj, days);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const date1Obj = typeof date1 === 'string' ? new Date(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? new Date(date2) : date2;
  return differenceInDays(date1Obj, date2Obj);
}

/**
 * Get all dates in a month
 */
export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(new Date(year, month - 1));

  let currentDate = firstDay;
  while (currentDate <= lastDay) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return getDaysInMonthFn(new Date(year, month - 1));
}

/**
 * Get month name from number (1-12)
 */
export function getMonthName(month: number, short: boolean = false): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, short ? 'MMM' : 'MMMM');
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: getMonth(now) + 1, // getMonth returns 0-11
    year: getYear(now),
  };
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Check if date string is valid
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Get date range for last N days
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const date = subDays(today, i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }

  return dates.reverse();
}

/**
 * Format date for display (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  if (isTodayFn(dateObj)) {
    return 'Today';
  }

  const yesterday = subDays(now, 1);
  if (isSameDayFn(dateObj, yesterday)) {
    return 'Yesterday';
  }

  const tomorrow = addDays(now, 1);
  if (isSameDayFn(dateObj, tomorrow)) {
    return 'Tomorrow';
  }

  return format(dateObj, 'MMM d');
}
