import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { getLast30Days, getLastNDays } from '@/utils/dateHelpers';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { getLocalHabits, getAllLocalCompletions } from '@/services/storage/LocalStorageService';

export interface AnalyticsSummary {
    totalCompletions: number;
    avgCompletionRate: number;
    bestStreak: number;
    activeHabits: number;
    completionsByDate: Record<string, number>;
    ratesByDate: Record<string, number>;
    weeklyData: Array<{ date: string; rate: number; steps: number }>;
}

function buildSummary(
    habits: { id: string }[],
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

    for (const date of last30) {
        const count = activeCompletions.filter((c) => c.date === date).length;
        completionsByDate[date] = count;
        ratesByDate[date] = activeHabits > 0 ? Math.min(Math.round((count / activeHabits) * 100), 100) : 0;
    }

    let bestStreak = 0;
    for (const habit of habits) {
        const dates = activeCompletions.filter((c) => c.habit_id === habit.id).map((c) => c.date);
        const streak = calculateCurrentStreak(dates);
        if (streak > bestStreak) bestStreak = streak;
    }

    const avgCompletionRate = last30.reduce((sum, d) => sum + (ratesByDate[d] ?? 0), 0) / last30.length;

    const weeklyData = getLastNDays(7).reverse().map((date) => ({
        date,
        rate: ratesByDate[date] ?? 0,
        steps: stepsMap[date] ?? 0,
    }));

    return {
        totalCompletions: activeCompletions.length,
        avgCompletionRate: Math.round(avgCompletionRate),
        bestStreak,
        activeHabits,
        completionsByDate,
        ratesByDate,
        weeklyData,
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
                const [completionsSnap, habitsSnap, stepsSnap] = await Promise.all([
                    getDocs(query(
                        collection(db, 'users', user.uid, 'completions'),
                        where('date', '>=', startDate),
                        where('date', '<=', endDate)
                    )),
                    getDocs(collection(db, 'users', user.uid, 'habits')),
                    getDocs(query(
                        collection(db, 'users', user.uid, 'step_data'),
                        where('date', '>=', startDate),
                        where('date', '<=', endDate)
                    )),
                ]);

                const completions = completionsSnap.docs.map((d) => d.data() as { habit_id: string; date: string });
                const habits = habitsSnap.docs
                    .map((d) => ({ id: d.id, ...d.data() } as { id: string; archived_at: string | null }))
                    .filter((h) => h.archived_at === null);

                const stepsMap: Record<string, number> = {};
                for (const d of stepsSnap.docs) {
                    const s = d.data();
                    stepsMap[s.date] = s.steps;
                }

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
