import { Habit, Completion } from '@/types/habit.types';
import { getLastNDays, friendlyDate } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { calculateWeeklyStreak } from '@/utils/frequency';

export interface WeeklyHabitStat {
    id: string;
    title: string;
    icon: string | null;
    color: string;
    count: number;
    weekly: boolean;
    /** Human label for the period, e.g. "5/7 days" or "done this week". */
    detail: string;
}

export interface StreakChange {
    id: string;
    title: string;
    icon: string | null;
    color: string;
    streak: number;
    /** Unit for the streak number. */
    unit: 'day' | 'week';
}

export interface WeeklyReviewStats {
    rangeLabel: string;
    completionRate: number;
    prevCompletionRate: number;
    delta: number;
    totalCompletions: number;
    perfectDays: number;
    bestHabit: WeeklyHabitStat | null;
    worstHabit: WeeklyHabitStat | null;
    /** Streaks of 3+ days that started this week. */
    newStreaks: StreakChange[];
    /** Streaks of 3+ days at week start that have since broken. */
    lostStreaks: StreakChange[];
    /** Current streaks, longest first. */
    topStreaks: StreakChange[];
}

/** Streak as it stood on `asOf` (YYYY-MM-DD), counting back from that day or the day before. */
function streakAsOf(completionDates: string[], asOf: string): number {
    const dates = completionDates.filter((d) => d <= asOf);
    if (dates.length === 0) return 0;
    const completed = new Set(dates);

    const [y, m, d] = asOf.split('-').map(Number);
    const cursor = new Date(y, m - 1, d);
    const fmt = (dt: Date) =>
        `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

    if (!completed.has(fmt(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!completed.has(fmt(cursor))) return 0;
    }
    let streak = 0;
    while (completed.has(fmt(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

/**
 * Compute the weekly review from the last 14 days of completions:
 * this week = the 7 days ending today, compared against the 7 days before.
 */
export function computeWeeklyReview(habits: Habit[], completions: Completion[]): WeeklyReviewStats {
    const last14 = getLastNDays(14); // newest first
    const weekDates = last14.slice(0, 7);
    const prevWeekDates = last14.slice(7, 14);
    const weekSet = new Set(weekDates);
    const prevWeekSet = new Set(prevWeekDates);
    const weekStart = weekDates[6];
    const prevWeekEnd = prevWeekDates[0];

    const habitIds = new Set(habits.map((h) => h.id));
    const valid = completions.filter((c) => habitIds.has(c.habit_id));

    const dailyHabits = habits.filter((h) => h.frequency !== 'weekly');
    const weeklyHabits = habits.filter((h) => h.frequency === 'weekly');
    const dailyIds = new Set(dailyHabits.map((h) => h.id));

    const weekCompletions = valid.filter((c) => weekSet.has(c.date));
    const prevWeekCompletions = valid.filter((c) => prevWeekSet.has(c.date));

    // Expected "slots": daily habits = 7/week, weekly habits = 1/week.
    const slots = dailyHabits.length * 7 + weeklyHabits.length;
    const doneInWindow = (windowCompletions: Completion[]) => {
        const dailyDone = windowCompletions.filter((c) => dailyIds.has(c.habit_id)).length;
        const weeklyDone = weeklyHabits.filter((h) =>
            windowCompletions.some((c) => c.habit_id === h.id),
        ).length;
        return dailyDone + weeklyDone;
    };
    const completionRate = slots > 0 ? Math.round((doneInWindow(weekCompletions) / slots) * 100) : 0;
    const prevCompletionRate = slots > 0 ? Math.round((doneInWindow(prevWeekCompletions) / slots) * 100) : 0;

    // Perfect days: every *daily* habit done that day (weekly habits aren't daily).
    let perfectDays = 0;
    if (dailyHabits.length > 0) {
        for (const day of weekDates) {
            const done = new Set(
                weekCompletions.filter((c) => c.date === day && dailyIds.has(c.habit_id)).map((c) => c.habit_id),
            );
            if (done.size === dailyHabits.length) perfectDays++;
        }
    }

    // Per-habit weekly stats, ranked by how close to the period goal they got.
    const counts = habits.map((h) => {
        const count = weekCompletions.filter((c) => c.habit_id === h.id).length;
        const weekly = h.frequency === 'weekly';
        const rate = weekly ? (count > 0 ? 1 : 0) : count / 7;
        const detail = weekly
            ? (count > 0 ? 'done this week' : 'not done this week')
            : `${count}/7 days`;
        return { id: h.id, title: h.title, icon: h.icon, color: h.color, count, weekly, rate, detail };
    });
    const sorted = [...counts].sort((a, b) => b.rate - a.rate);
    const bestHabit = sorted.length > 0 && sorted[0].rate > 0 ? sorted[0] : null;
    const last = sorted[sorted.length - 1];
    const worstHabit = sorted.length >= 2 && last.rate < 1 && last.id !== bestHabit?.id ? last : null;

    // Streak movement over the week.
    const newStreaks: StreakChange[] = [];
    const lostStreaks: StreakChange[] = [];
    const topStreaks: StreakChange[] = [];
    for (const h of dailyHabits) {
        const dates = valid.filter((c) => c.habit_id === h.id).map((c) => c.date);
        const current = calculateCurrentStreak(dates);
        const atWeekStart = streakAsOf(dates, prevWeekEnd);
        const entry = { id: h.id, title: h.title, icon: h.icon, color: h.color, streak: current, unit: 'day' as const };
        if (current >= 3 && atWeekStart === 0) newStreaks.push(entry);
        if (atWeekStart >= 3 && current === 0) lostStreaks.push({ ...entry, streak: atWeekStart });
        if (current > 0) topStreaks.push(entry);
    }
    // Weekly habits contribute their week-streak to the "current streaks" list.
    for (const h of weeklyHabits) {
        const dates = valid.filter((c) => c.habit_id === h.id).map((c) => c.date);
        const current = calculateWeeklyStreak(dates);
        if (current > 0) {
            topStreaks.push({ id: h.id, title: h.title, icon: h.icon, color: h.color, streak: current, unit: 'week' });
        }
    }
    topStreaks.sort((a, b) => b.streak - a.streak);

    return {
        rangeLabel: `${friendlyDate(weekStart)} – ${friendlyDate(weekDates[0])}`,
        completionRate,
        prevCompletionRate,
        delta: completionRate - prevCompletionRate,
        totalCompletions: weekCompletions.length,
        perfectDays,
        bestHabit,
        worstHabit,
        newStreaks,
        lostStreaks,
        topStreaks: topStreaks.slice(0, 3),
    };
}
