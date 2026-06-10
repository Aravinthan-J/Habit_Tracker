import { Habit, Completion } from '@/types/habit.types';
import { getLastNDays, friendlyDate } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';

export interface WeeklyHabitStat {
    id: string;
    title: string;
    icon: string | null;
    color: string;
    count: number;
}

export interface StreakChange {
    id: string;
    title: string;
    icon: string | null;
    color: string;
    streak: number;
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

    const weekCompletions = valid.filter((c) => weekSet.has(c.date));
    const prevWeekCompletions = valid.filter((c) => prevWeekSet.has(c.date));

    const slots = habits.length * 7;
    const completionRate = slots > 0 ? Math.round((weekCompletions.length / slots) * 100) : 0;
    const prevCompletionRate = slots > 0 ? Math.round((prevWeekCompletions.length / slots) * 100) : 0;

    // Perfect days: every habit done on that day
    let perfectDays = 0;
    if (habits.length > 0) {
        for (const day of weekDates) {
            const done = new Set(weekCompletions.filter((c) => c.date === day).map((c) => c.habit_id));
            if (done.size === habits.length) perfectDays++;
        }
    }

    // Per-habit weekly counts
    const counts = habits.map((h) => ({
        id: h.id,
        title: h.title,
        icon: h.icon,
        color: h.color,
        count: weekCompletions.filter((c) => c.habit_id === h.id).length,
    }));
    const sorted = [...counts].sort((a, b) => b.count - a.count);
    const bestHabit = sorted.length > 0 && sorted[0].count > 0 ? sorted[0] : null;
    const last = sorted[sorted.length - 1];
    const worstHabit = sorted.length >= 2 && last.count < 7 && last.id !== bestHabit?.id ? last : null;

    // Streak movement over the week
    const newStreaks: StreakChange[] = [];
    const lostStreaks: StreakChange[] = [];
    const topStreaks: StreakChange[] = [];
    for (const h of habits) {
        const dates = valid.filter((c) => c.habit_id === h.id).map((c) => c.date);
        const current = calculateCurrentStreak(dates);
        const atWeekStart = streakAsOf(dates, prevWeekEnd);
        const entry = { id: h.id, title: h.title, icon: h.icon, color: h.color, streak: current };
        if (current >= 3 && atWeekStart === 0) newStreaks.push(entry);
        if (atWeekStart >= 3 && current === 0) lostStreaks.push({ ...entry, streak: atWeekStart });
        if (current > 0) topStreaks.push(entry);
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
