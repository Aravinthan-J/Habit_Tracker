import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { getLastNDays } from '@/utils/dateHelpers';

export interface HabitNote {
    date: string;
    note: string;
}

export function useHabitNotes(habitId: string) {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['habit-notes', user?.uid, habitId],
        queryFn: async (): Promise<HabitNote[]> => {
            if (!user || !habitId) return [];
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
            const results: HabitNote[] = [];
            for (const d of snap.docs) {
                const data = d.data();
                const note = data.notes?.[habitId];
                if (note && typeof note === 'string') {
                    results.push({ date: d.id, note });
                }
            }
            return results.sort((a, b) => b.date.localeCompare(a.date));
        },
        enabled: !!user && !!habitId,
        staleTime: 1000 * 60,
    });
}
