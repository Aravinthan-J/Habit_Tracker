import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { getLast30Days, getLastNDays } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { getWeekStart } from '@/utils/frequency';
import { getLocalHabits, getAllLocalCompletions } from '@/services/storage/LocalStorageService';

type AnalyticsHabit = {
    id: string;
    created_at?: string;
    title?: string;
    color?: string;
    icon?: string | null;
    frequency?: 'daily' | 'weekly';
};

export interface HabitBreakdown {
    id: string;
    title: string;
    color: string;
    icon: string | null;
    rate: number;
    count: number;
    weekly: boolean;
}

export interface MoodSummary {
    daysLogged: number;
    avgMood: number; // 0 if none
    bestHabit: { id: string; title: string; color: string; icon: string | null; lift: number } | null;
}

export interface AnalyticsSummary {
    totalCompletions: number;
    avgCompletionRate: number;
    bestStreak: number;
    activeHabits: number;
    completionsByDate: Record<string, number>;
    ratesByDate: Record<string, number>;
    weeklyData: Array<{ date: string; rate: number; steps: number }>;
    trend: Array<{ date: string; rate: number }>;
    habitBreakdown: HabitBreakdown[];
    mood: MoodSummary;
}

function buildSummary(
    habits: AnalyticsHabit[],
    completions: { habit_id: string; date: string }[],
    last30: string[],
    stepsMap: Record<string, number> = {},
    moodMap: Record<string, number> = {},
): AnalyticsSummary {
    const activeHabits = habits.length;
    const activeHabitIds = new Set(habits.map((h) => h.id));

    // Only count completions for habits that still exist (ignore deleted habit completions)
    const activeCompletions = completions.filter((c) => activeHabitIds.has(c.habit_id));

    const dailyHabits = habits.filter((h) => h.frequency !== 'weekly');
    const weeklyHabits = habits.filter((h) => h.frequency === 'weekly');

    // For each weekly habit, the set of week-starts it was completed in. A weekly
    // habit counts as "satisfied" on every day of a week it was done — mirroring
    // the home screen, where a weekly habit shows done for the whole week.
    const weeklyDoneWeeks = new Map<string, Set<string>>();
    for (const h of weeklyHabits) {
        const weeks = new Set<string>();
        for (const c of activeCompletions) {
            if (c.habit_id === h.id) weeks.add(getWeekStart(c.date));
        }
        weeklyDoneWeeks.set(h.id, weeks);
    }

    const existedOn = (h: AnalyticsHabit, date: string) =>
        !h.created_at || h.created_at.slice(0, 10) <= date;

    const completionsByDate: Record<string, number> = {};
    const ratesByDate: Record<string, number> = {};

    // Track totals for an accurate avg (skip days where no habits existed yet)
    let rateSum = 0;
    let rateDays = 0;

    for (const date of last30) {
        const week = getWeekStart(date);
        const dailyOnDay = dailyHabits.filter((h) => existedOn(h, date)).length;
        const weeklyOnDay = weeklyHabits.filter((h) => existedOn(h, date)).length;
        const habitsOnDay = dailyOnDay + weeklyOnDay;

        const dailyDone = activeCompletions.filter(
            (c) => c.date === date && !weeklyDoneWeeks.has(c.habit_id),
        ).length;
        const weeklyDone = weeklyHabits.filter(
            (h) => existedOn(h, date) && weeklyDoneWeeks.get(h.id)?.has(week),
        ).length;

        // Raw completions logged on this date (weekly habits only on their actual day)
        completionsByDate[date] = activeCompletions.filter((c) => c.date === date).length;

        if (habitsOnDay > 0) {
            const rate = Math.min(Math.round(((dailyDone + weeklyDone) / habitsOnDay) * 100), 100);
            ratesByDate[date] = rate;
            rateSum += rate;
            rateDays += 1;
        } else {
            ratesByDate[date] = 0;
        }
    }

    // Best streak uses daily habits (measured in days) to keep the unit consistent.
    let bestStreak = 0;
    for (const habit of dailyHabits) {
        const dates = activeCompletions.filter((c) => c.habit_id === habit.id).map((c) => c.date);
        const streak = calculateCurrentStreak(dates);
        if (streak > bestStreak) bestStreak = streak;
    }

    const avgCompletionRate = rateDays > 0 ? Math.round(rateSum / rateDays) : 0;

    const weeklyData = getLastNDays(7).reverse().map((date) => ({
        date,
        rate: ratesByDate[date] ?? 0,
        steps: stepsMap[date] ?? 0,
    }));

    const trend = last30.map((date) => ({ date, rate: ratesByDate[date] ?? 0 }));

    const last30Set = new Set(last30);
    // Distinct weeks covered by the window (for weekly-habit denominators).
    const weeksInWindow = Array.from(new Set(last30.map(getWeekStart)));
    const habitBreakdown: HabitBreakdown[] = habits
        .map((h) => {
            const inRange = activeCompletions.filter((c) => c.habit_id === h.id && last30Set.has(c.date));
            let rate: number;
            let count: number;
            if (h.frequency === 'weekly') {
                // weeks completed / weeks the habit existed in the window
                const doneWeeks = new Set(inRange.map((c) => getWeekStart(c.date)));
                const possibleWeeks = weeksInWindow.filter(
                    (w) => !h.created_at || h.created_at.slice(0, 10) <= w,
                ).length;
                count = doneWeeks.size;
                rate = possibleWeeks > 0 ? Math.min(Math.round((count / possibleWeeks) * 100), 100) : 0;
            } else {
                const possibleDays = last30.filter((d) => !h.created_at || h.created_at.slice(0, 10) <= d).length;
                count = inRange.length;
                rate = possibleDays > 0 ? Math.min(Math.round((count / possibleDays) * 100), 100) : 0;
            }
            return {
                id: h.id,
                title: h.title ?? 'Habit',
                color: h.color ?? '#6C63FF',
                icon: h.icon ?? null,
                rate,
                count,
                weekly: h.frequency === 'weekly',
            };
        })
        .sort((a, b) => b.rate - a.rate);

    // ── Mood ↔ habit correlation ──────────────────────────────────────────────
    const moodDates = last30.filter((d) => (moodMap[d] ?? 0) > 0);
    const avgMood = moodDates.length > 0
        ? moodDates.reduce((s, d) => s + moodMap[d], 0) / moodDates.length
        : 0;

    let bestMoodHabit: MoodSummary['bestHabit'] = null;
    if (moodDates.length >= 4) {
        const doneDates = (h: AnalyticsHabit) => {
            if (h.frequency === 'weekly') {
                const weeks = weeklyDoneWeeks.get(h.id) ?? new Set<string>();
                return new Set(moodDates.filter((d) => weeks.has(getWeekStart(d))));
            }
            const set = new Set(activeCompletions.filter((c) => c.habit_id === h.id).map((c) => c.date));
            return new Set(moodDates.filter((d) => set.has(d)));
        };
        let bestLift = 0.2; // require a meaningful difference
        for (const h of habits) {
            const done = doneDates(h);
            const onDays = moodDates.filter((d) => done.has(d));
            const offDays = moodDates.filter((d) => !done.has(d));
            if (onDays.length < 2 || offDays.length < 2) continue;
            const avgOn = onDays.reduce((s, d) => s + moodMap[d], 0) / onDays.length;
            const avgOff = offDays.reduce((s, d) => s + moodMap[d], 0) / offDays.length;
            const lift = avgOn - avgOff;
            if (lift > bestLift) {
                bestLift = lift;
                bestMoodHabit = {
                    id: h.id,
                    title: h.title ?? 'Habit',
                    color: h.color ?? '#6C63FF',
                    icon: h.icon ?? null,
                    lift: Math.round(lift * 10) / 10,
                };
            }
        }
    }

    return {
        totalCompletions: activeCompletions.length,
        avgCompletionRate,
        bestStreak,
        activeHabits,
        completionsByDate,
        ratesByDate,
        weeklyData,
        trend,
        habitBreakdown,
        mood: {
            daysLogged: moodDates.length,
            avgMood: Math.round(avgMood * 10) / 10,
            bestHabit: bestMoodHabit,
        },
    };
}

export function useAnalytics() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['analytics', user?.uid],
        queryFn: async (): Promise<AnalyticsSummary> => {
            if (!user) throw new Error('Not authenticated');

            const last30 = getLast30Days();
            const startDate = last30[0];
            const endDate = last30[last30.length - 1];

            try {
                const [dailySnap, habitsSnap] = await Promise.all([
                    getDocs(query(
                        collection(db, 'users', user.uid, 'daily'),
                        where(documentId(), '>=', startDate),
                        where(documentId(), '<=', endDate)
                    )),
                    getDocs(collection(db, 'users', user.uid, 'habits')),
                ]);

                const completions: { habit_id: string; date: string }[] = [];
                const stepsMap: Record<string, number> = {};
                const moodMap: Record<string, number> = {};
                for (const d of dailySnap.docs) {
                    const date = d.id;
                    const data = d.data();
                    const ids = (data.completedHabitIds ?? []) as string[];
                    for (const habit_id of ids) {
                        completions.push({ habit_id, date });
                    }
                    if (data.steps != null) stepsMap[date] = data.steps as number;
                    if (typeof data.mood === 'number' && data.mood > 0) moodMap[date] = data.mood;
                }
                const habits = habitsSnap.docs
                    .map((d) => ({ id: d.id, ...d.data() } as { id: string; archived_at: string | null; created_at?: string }))
                    .filter((h) => h.archived_at === null);

                return buildSummary(habits, completions, last30, stepsMap, moodMap);
            } catch {
                const habits = await getLocalHabits(user.uid);
                const allCompletions = await getAllLocalCompletions(user.uid);
                const completions = allCompletions.filter((c) => c.date >= startDate && c.date <= endDate);
                return buildSummary(habits, completions, last30);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });
}
