import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { usePreferences } from './usePreferences';
import { today } from '@/utils/dateHelpers';
import { queueOperation } from '@/services/storage/LocalStorageService';

/**
 * Tracks today's water intake (glasses) stored on the daily doc as `water_glasses`.
 * Optimistic updates; falls back to the offline sync queue if the write fails.
 */
export function useWater() {
    const { user } = useAuthStore();
    const { waterGoalGlasses, setWaterGoalGlasses } = usePreferences();
    const qc = useQueryClient();
    const date = today();
    const queryKey = ['water', user?.uid, date];

    const { data: glasses = 0 } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return 0;
            try {
                const snap = await getDoc(doc(db, 'users', user.uid, 'daily', date));
                return snap.exists() ? ((snap.data().water_glasses as number) ?? 0) : 0;
            } catch {
                return 0;
            }
        },
        enabled: !!user,
        staleTime: 1000 * 15,
    });

    const mutation = useMutation({
        mutationFn: async (next: number) => {
            const val = Math.max(0, next);
            if (!user) return val;
            try {
                await setDoc(
                    doc(db, 'users', user.uid, 'daily', date),
                    { water_glasses: val },
                    { merge: true },
                );
            } catch {
                await queueOperation({
                    operation: 'SET',
                    table_name: 'daily',
                    record_id: date,
                    payload: JSON.stringify({ water_glasses: val }),
                });
            }
            return val;
        },
        onMutate: async (next: number) => {
            await qc.cancelQueries({ queryKey });
            const prev = qc.getQueryData<number>(queryKey) ?? 0;
            qc.setQueryData<number>(queryKey, Math.max(0, next));
            return { prev };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.prev != null) qc.setQueryData(queryKey, ctx.prev);
        },
        onSettled: () => qc.invalidateQueries({ queryKey }),
    });

    return {
        glasses,
        goal: waterGoalGlasses,
        increment: () => mutation.mutate(glasses + 1),
        decrement: () => mutation.mutate(Math.max(0, glasses - 1)),
        setGoal: setWaterGoalGlasses,
    };
}
