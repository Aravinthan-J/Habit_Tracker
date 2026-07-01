import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, getDocs, collection, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { today, getLastNDays } from '@/utils/dateHelpers';

export interface WeightEntry {
    date: string;
    weight: number; // kg
}

export function useWeight() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const todayStr = today();

    const weightQuery = useQuery({
        queryKey: ['weight', user?.uid],
        queryFn: async (): Promise<WeightEntry[]> => {
            if (!user) return [];
            const last90 = getLastNDays(90);
            const startDate = last90[last90.length - 1];
            const endDate = last90[0];
            const snap = await getDocs(
                query(
                    collection(db, 'users', user.uid, 'daily'),
                    where(documentId(), '>=', startDate),
                    where(documentId(), '<=', endDate),
                )
            );
            const entries: WeightEntry[] = [];
            for (const d of snap.docs) {
                const w = d.data().weight;
                if (typeof w === 'number' && w > 0) {
                    entries.push({ date: d.id, weight: w });
                }
            }
            return entries.sort((a, b) => a.date.localeCompare(b.date));
        },
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const logWeight = useMutation({
        mutationFn: async (weight: number) => {
            if (!user) throw new Error('Not signed in');
            await setDoc(
                doc(db, 'users', user.uid, 'daily', todayStr),
                { weight },
                { merge: true },
            );
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['weight', user?.uid] }),
    });

    const todayEntry = weightQuery.data?.find((e) => e.date === todayStr);

    return {
        entries: weightQuery.data ?? [],
        todayWeight: todayEntry?.weight ?? null,
        isLoading: weightQuery.isLoading,
        logWeight,
    };
}
