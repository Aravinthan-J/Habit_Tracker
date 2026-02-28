import { Completion } from '@/types/habit.types';
import { formatDate } from './dateHelpers';

/**
 * Calculate the current streak from a sorted list of completion dates (newest first)
 */
export function calculateCurrentStreak(completionDates: string[]): number {
    if (completionDates.length === 0) return 0;

    const sorted = [...completionDates].sort((a, b) => b.localeCompare(a));
    const todayStr = formatDate(new Date());
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yesterdayStr = formatDate(y);

    // Streak must include today or yesterday to be "active"
    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        // Parse as local date (split avoids UTC midnight offset issues)
        const [py, pm, pd] = sorted[i - 1].split('-').map(Number);
        const [cy, cm, cd] = sorted[i].split('-').map(Number);
        const prev = new Date(py, pm - 1, pd);
        const curr = new Date(cy, cm - 1, cd);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

/**
 * Calculate the longest streak from a sorted list of completion dates
 */
export function calculateLongestStreak(completionDates: string[]): number {
    if (completionDates.length === 0) return 0;

    const sorted = [...completionDates].sort((a, b) => a.localeCompare(b));
    let longest = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
        const [py, pm, pd] = sorted[i - 1].split('-').map(Number);
        const [cy, cm, cd] = sorted[i].split('-').map(Number);
        const prev = new Date(py, pm - 1, pd);
        const curr = new Date(cy, cm - 1, cd);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
            current++;
            if (current > longest) longest = current;
        } else {
            current = 1;
        }
    }
    return longest;
}

/**
 * Get completions for a specific habit from a list
 */
export function getHabitCompletionDates(
    completions: Completion[],
    habitId: string
): string[] {
    return completions
        .filter((c) => c.habit_id === habitId)
        .map((c) => c.date);
}

/**
 * Calculate completion rate for last N days
 */
export function completionRate(completionDates: string[], days = 30): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = completionDates.filter((d) => new Date(d) >= cutoff);
    return Math.round((recent.length / days) * 100);
}

/**
 * Check if habit was completed on a specific date
 */
export function wasCompletedOn(completionDates: string[], date: string): boolean {
    return completionDates.includes(date);
}
