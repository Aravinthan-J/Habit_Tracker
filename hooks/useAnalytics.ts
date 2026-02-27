import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
    const completionsByDate: Record<string, number> = {};
    const ratesByDate: Record<string, number> = {};

    for (const date of last30) {
        const count = completions.filter((c) => c.date === date).length;
        completionsByDate[date] = count;
        ratesByDate[date] = activeHabits > 0 ? Math.round((count / activeHabits) * 100) : 0;
    }

    let bestStreak = 0;
    for (const habit of habits) {
        const dates = completions.filter((c) => c.habit_id === habit.id).map((c) => c.date);
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
        totalCompletions: completions.length,
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
        queryKey: ['analytics', user?.id],
        queryFn: async (): Promise<AnalyticsSummary> => {
            if (!user) throw new Error('Not authenticated');

            const last30 = getLast30Days();
            const startDate = last30[0];
            const endDate = last30[last30.length - 1];

            try {
                const [completionsRes, habitsRes, stepsRes] = await Promise.all([
                    supabase.from('completions').select('habit_id, date').eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
                    supabase.from('habits').select('id').eq('user_id', user.id).is('archived_at', null),
                    supabase.from('step_data').select('date, steps').eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
                ]);

                if (completionsRes.error || habitsRes.error) throw completionsRes.error ?? habitsRes.error;

                const stepsMap: Record<string, number> = {};
                for (const s of stepsRes.data ?? []) stepsMap[s.date] = s.steps;

                return buildSummary(habitsRes.data ?? [], completionsRes.data ?? [], last30, stepsMap);
            } catch {
                // Offline fallback from local SQLite
                const habits = await getLocalHabits(user.id);
                const allCompletions = await getAllLocalCompletions(user.id);
                const completions = allCompletions.filter((c) => c.date >= startDate && c.date <= endDate);
                return buildSummary(habits, completions, last30);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });
}
