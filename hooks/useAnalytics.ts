import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { getLast30Days, getLastNDays } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { getLocalHabits, getAllLocalCompletions } from '@/services/storage/LocalStorageService';

export interface HabitBreakdown {
    id: string;
    title: string;
    color: string;
    icon: string | null;
    rate: number;
    count: number;
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
}

function buildSummary(
    habits: { id: string; created_at?: string; title?: string; color?: string; icon?: string | null }[],
    completions: { habit_id: string; date: string }[],
    last30: string[],
    stepsMap: Record<string, number> = {},
): AnalyticsSummary {
    const activeHabits = habits.length;
    const activeHabitIds = new Set(habits.map((h) => h.id));

    // Only count completions for habits that still exist (ignore deleted habit completions)
    const activeCompletions = completions.filter((c) => activeHabitIds.has(c.habit_id));

    const completionsByDate: Record<string, number> = {};
    const ratesByDate: Record<string, number> = {};

    // Track totals for an accurate avg (skip days where no habits existed yet)
    let rateSum = 0;
    let rateDays = 0;

    for (const date of last30) {
        // Only include habits that existed on this date
        const habitsOnDay = habits.filter(
            (h) => !h.created_at || h.created_at.slice(0, 10) <= date
        ).length;
        const count = activeCompletions.filter((c) => c.date === date).length;
        completionsByDate[date] = count;

        if (habitsOnDay > 0) {
            const rate = Math.min(Math.round((count / habitsOnDay) * 100), 100);
            ratesByDate[date] = rate;
            rateSum += rate;
            rateDays += 1;
        } else {
            ratesByDate[date] = 0;
        }
    }

    let bestStreak = 0;
    for (const habit of habits) {
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
    const habitBreakdown: HabitBreakdown[] = habits
        .map((h) => {
            const possibleDays = last30.filter((d) => !h.created_at || h.created_at.slice(0, 10) <= d).length;
            const count = activeCompletions.filter((c) => c.habit_id === h.id && last30Set.has(c.date)).length;
            const rate = possibleDays > 0 ? Math.min(Math.round((count / possibleDays) * 100), 100) : 0;
            return {
                id: h.id,
                title: h.title ?? 'Habit',
                color: h.color ?? '#6C63FF',
                icon: h.icon ?? null,
                rate,
                count,
            };
        })
        .sort((a, b) => b.rate - a.rate);

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
                for (const d of dailySnap.docs) {
                    const date = d.id;
                    const data = d.data();
                    const ids = (data.completedHabitIds ?? []) as string[];
                    for (const habit_id of ids) {
                        completions.push({ habit_id, date });
                    }
                    if (data.steps != null) stepsMap[date] = data.steps as number;
                }
                const habits = habitsSnap.docs
                    .map((d) => ({ id: d.id, ...d.data() } as { id: string; archived_at: string | null; created_at?: string }))
                    .filter((h) => h.archived_at === null);

                return buildSummary(habits, completions, last30, stepsMap);
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
