/**
 * Completion Types
 * Shared completion-related interfaces
 */

export interface Completion {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completedAt: string;
}

export interface CreateCompletionData {
  habitId: string;
  date: string;
}

export interface CompletionFilters {
  habitId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DayCompletion {
  date: string;
  habitIds: string[];
}

export interface MonthlyCalendar {
  completions: DayCompletion[];
  habits: Array<{
    id: string;
    title: string;
    color: string;
    icon: string | null;
  }>;
}

export interface CompletionWithHabit extends Completion {
  habit: {
    id: string;
    title: string;
    color: string;
    icon: string | null;
  };
}
