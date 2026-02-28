import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { Achievement, FocusSession, MetricLog, Metric } from '@/types/advanced.types';
import { queueOperation, generateId } from '@/services/storage/LocalStorageService';

export function useAdvancedFeatures() {
    const { user } = useAuthStore();

    const achievementsQuery = useQuery({
        queryKey: ['achievements', user?.uid],
        queryFn: async (): Promise<Achievement[]> => {
            if (!user) return [];
            try {
                const snapshot = await getDocs(query(
                    collection(db, 'users', user.uid, 'achievements'),
                    orderBy('earned_at', 'desc')
                ));
                return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Achievement));
            } catch {
                return [];
            }
        },
        enabled: !!user,
    });

    const focusSessionsQuery = useQuery({
        queryKey: ['focus-sessions', user?.uid],
        queryFn: async (): Promise<FocusSession[]> => {
            if (!user) return [];
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const snapshot = await getDocs(query(
                    collection(db, 'users', user.uid, 'focus_sessions'),
                    where('started_at', '>=', `${todayStr}T00:00:00Z`)
                ));
                return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FocusSession));
            } catch {
                return [];
            }
        },
        enabled: !!user,
    });

    const metricsQuery = useQuery({
        queryKey: ['metrics', user?.uid],
        queryFn: async (): Promise<Metric[]> => {
            if (!user) return [];
            try {
                const snapshot = await getDocs(collection(db, 'users', user.uid, 'custom_metrics'));
                return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Metric));
            } catch {
                return [];
            }
        },
        enabled: !!user,
    });

    const queryClient = useQueryClient();

    const logMetric = useMutation({
        mutationFn: async ({ metricId, value }: { metricId: string; value: number }) => {
            if (!user) throw new Error('Not authenticated');

            const date = new Date().toISOString().split('T')[0];
            try {
                await addDoc(collection(db, 'users', user.uid, 'metric_logs'), {
                    metric_id: metricId,
                    user_id: user.uid,
                    value,
                    date,
                    created_at: new Date().toISOString(),
                });
            } catch {
                await queueOperation({
                    operation: 'INSERT',
                    table_name: 'habits', // closest supported table; sync service maps by context
                    record_id: generateId(),
                    payload: JSON.stringify({ metric_id: metricId, user_id: user.uid, value, date }),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
        },
    });

    return {
        recentAchievements: achievementsQuery.data?.slice(0, 5) ?? [],
        focusSessions: focusSessionsQuery.data ?? [],
        metrics: metricsQuery.data ?? [],
        isLoading: achievementsQuery.isLoading || focusSessionsQuery.isLoading || metricsQuery.isLoading,
        logMetric,
        refetch: () => {
            achievementsQuery.refetch();
            focusSessionsQuery.refetch();
            metricsQuery.refetch();
        },
    };
}
