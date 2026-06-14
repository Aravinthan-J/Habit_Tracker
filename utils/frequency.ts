import { Habit } from '@/types/habit.types';
import { today, formatDate } from './dateHelpers';

/** Monday-based start (YYYY-MM-DD) of the calendar week containing `dateStr`. */
export function getWeekStart(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dow = dt.getDay();            // 0=Sun … 6=Sat
    const sinceMonday = (dow + 6) % 7;  // days since Monday
    dt.setDate(dt.getDate() - sinceMonday);
    return formatDate(dt);
}

function prevWeekStart(weekStart: string): string {
    const [y, m, d] = weekStart.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - 7);
    return formatDate(dt);
}

export function isWeekly(habit: Pick<Habit, 'frequency'>): boolean {
    return habit.frequency === 'weekly';
}

/**
 * For a weekly habit, the completion date that falls within the week of `ref`
 * (latest one if several), or null if the habit isn't done this week.
 */
export function inWeekCompletion(completionDates: string[], ref: string = today()): string | null {
    const ws = getWeekStart(ref);
    const inWeek = completionDates.filter((d) => getWeekStart(d) === ws).sort();
    return inWeek.length ? inWeek[inWeek.length - 1] : null;
}

/** Whether the habit counts as "done" for its current period (day or week). */
export function isDoneForPeriod(
    habit: Pick<Habit, 'frequency'>,
    completionDates: string[],
    isDoneToday: boolean,
    ref: string = today(),
): boolean {
    return isWeekly(habit) ? inWeekCompletion(completionDates, ref) !== null : isDoneToday;
}

/** Consecutive-week streak: number of back-to-back weeks with ≥1 completion. */
export function calculateWeeklyStreak(completionDates: string[], ref: string = today()): number {
    if (completionDates.length === 0) return 0;
    const weeks = new Set(completionDates.map(getWeekStart));

    let cursor = getWeekStart(ref);
    // Active only if this week or last week has a completion.
    if (!weeks.has(cursor)) {
        cursor = prevWeekStart(cursor);
        if (!weeks.has(cursor)) return 0;
    }

    let streak = 0;
    while (weeks.has(cursor)) {
        streak++;
        cursor = prevWeekStart(cursor);
    }
    return streak;
}

/** Longest run of consecutive weeks that had ≥1 completion. */
export function calculateLongestWeeklyStreak(completionDates: string[]): number {
    if (completionDates.length === 0) return 0;
    const weekStarts = Array.from(new Set(completionDates.map(getWeekStart))).sort();
    let longest = 1;
    let run = 1;
    for (let i = 1; i < weekStarts.length; i++) {
        run = prevWeekStart(weekStarts[i]) === weekStarts[i - 1] ? run + 1 : 1;
        if (run > longest) longest = run;
    }
    return longest;
}

/** Distinct weeks with a completion whose week-start falls in `yyyymm` (YYYY-MM). */
export function weeksCompletedInMonth(completionDates: string[], yyyymm: string): number {
    const weeks = new Set<string>();
    for (const d of completionDates) {
        if (d.startsWith(yyyymm)) weeks.add(getWeekStart(d));
    }
    return weeks.size;
}
