/**
 * Completion entity
 */
export interface Completion {
    id: string;
    habitId: string;
    userId: string;
    date: Date | string;
    completedAt: Date | string;
}
/**
 * Completion with habit details
 */
export interface CompletionWithHabit extends Completion {
    habit: {
        id: string;
        title: string;
        color: string;
        icon: string;
    };
}
/**
 * Create completion data
 */
export interface CreateCompletionData {
    habitId: string;
    date: string;
}
/**
 * Completion filters
 */
export interface CompletionFilters {
    habitId?: string;
    startDate?: string;
    endDate?: string;
}
/**
 * Day completion data for calendar
 */
export interface DayCompletion {
    id: string;
    habitId: string;
    habitTitle: string;
    habitColor: string;
    habitIcon: string;
}
/**
 * Monthly calendar day
 */
export interface MonthlyCalendarDay {
    date: string;
    completions: DayCompletion[];
}
/**
 * Monthly calendar response
 */
export interface MonthlyCalendar {
    year: number;
    month: number;
    calendar: MonthlyCalendarDay[];
}
//# sourceMappingURL=completion.types.d.ts.map