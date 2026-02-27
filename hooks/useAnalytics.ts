import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getLast30Days, getLastNDays } from '@/utils/dateHelpers';
import { calculateCurrentStreak, calculateLongestStreak, completionRate } from '@/utils/streakCalculator';

export interface AnalyticsSummary {
    totalCompletions: number;
    avgCompletionRate: number;
    bestStreak: number;
    activeHabits: number;
    completionsByDate: Record<string, number>;
    ratesByDate: Record<string, number>;
    weeklyData: Array<{ date: string; rate: number; steps: number }>;
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

            // Fetch data in parallel
            const [completionsResult, habitsResult, stepsResult] = await Promise.all([
                supabase
                    .from('completions')
                    .select('*, habit_id, date')
                    .eq('user_id', user.id)
                    .gte('date', startDate)
                    .lte('date', endDate),
                supabase
                    .from('habits')
                    .select('id')
                    .eq('user_id', user.id)
                    .is('archived_at', null),
                supabase
                    .from('step_data')
                    .select('date, steps')
                    .eq('user_id', user.id)
                    .gte('date', startDate)
                    .lte('date', endDate),
            ]);

            const completions = completionsResult.data ?? [];
            const habits = habitsResult.data ?? [];
            const steps = stepsResult.data ?? [];
            const activeHabits = habits.length;
            const stepsMap: Record<string, number> = {};
            for (const s of steps) stepsMap[s.date] = s.steps;

            const completionsByDate: Record<string, number> = {};
            const ratesByDate: Record<string, number> = {};

            for (const date of last30) {
                const count = completions.filter((c) => c.date === date).length;
                completionsByDate[date] = count;
                ratesByDate[date] = activeHabits > 0 ? Math.round((count / activeHabits) * 100) : 0;
            }

            // Best streak across all habits
            let bestStreak = 0;
            for (const habit of habits) {
                const dates = completions.filter((c) => c.habit_id === habit.id).map((c) => c.date);
                const streak = calculateCurrentStreak(dates);
                if (streak > bestStreak) bestStreak = streak;
            }

            const avgCompletionRate =
                last30.reduce((sum, d) => sum + (ratesByDate[d] ?? 0), 0) / last30.length;

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
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });
}
