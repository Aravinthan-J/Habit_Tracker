import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Achievement, FocusSession, MetricLog, Metric } from '@/types/advanced.types';

export function useAdvancedFeatures() {
    const { user } = useAuthStore();

    const achievementsQuery = useQuery({
        queryKey: ['achievements', user?.id],
        queryFn: async (): Promise<Achievement[]> => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .eq('user_id', user.id)
                .order('earned_at', { ascending: false });
            if (error) return [];
            return data ?? [];
        },
        enabled: !!user,
    });

    const focusSessionsQuery = useQuery({
        queryKey: ['focus-sessions', user?.id],
        queryFn: async (): Promise<FocusSession[]> => {
            if (!user) return [];
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('focus_sessions')
                .select('*')
                .eq('user_id', user.id)
                .gte('started_at', `${today}T00:00:00Z`);
            if (error) return [];
            return data ?? [];
        },
        enabled: !!user,
    });

    const metricsQuery = useQuery({
        queryKey: ['metrics', user?.id],
        queryFn: async (): Promise<Metric[]> => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('custom_metrics')
                .select('*')
                .eq('user_id', user.id);
            if (error) return [];
            return data ?? [];
        },
        enabled: !!user,
    });

    return {
        recentAchievements: achievementsQuery.data?.slice(0, 5) ?? [],
        focusSessions: focusSessionsQuery.data ?? [],
        metrics: metricsQuery.data ?? [],
        isLoading: achievementsQuery.isLoading || focusSessionsQuery.isLoading || metricsQuery.isLoading,
        refetch: () => {
            achievementsQuery.refetch();
            focusSessionsQuery.refetch();
            metricsQuery.refetch();
        }
    };
}
