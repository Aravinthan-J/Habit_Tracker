import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { today } from '@/utils/dateHelpers';

/** Mood is a 1–5 scale. 0/undefined means "not logged". */
export const MOODS = [
    { value: 1, emoji: '😞', label: 'Awful' },
    { value: 2, emoji: '🙁', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' },
];

/** Read & write today's mood, stored on the user's daily doc (users/<uid>/daily/<date>.mood). */
export function useMood() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const date = today();
    const queryKey = ['mood', user?.uid, date];

    const moodQuery = useQuery({
        queryKey,
        queryFn: async (): Promise<number> => {
            if (!user) return 0;
            try {
                const snap = await getDoc(doc(db, 'users', user.uid, 'daily', date));
                const m = snap.exists() ? snap.data().mood : 0;
                return typeof m === 'number' ? m : 0;
            } catch {
                return 0;
            }
        },
        enabled: !!user,
        staleTime: 1000 * 30,
    });

    const setMood = useMutation({
        mutationFn: async (value: number) => {
            if (!user) throw new Error('Not authenticated');
            await setDoc(doc(db, 'users', user.uid, 'daily', date), { mood: value }, { merge: true });
            return value;
        },
        onMutate: async (value) => {
            await qc.cancelQueries({ queryKey });
            const prev = qc.getQueryData<number>(queryKey);
            qc.setQueryData(queryKey, value);
            return { prev };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.prev !== undefined) qc.setQueryData(queryKey, ctx.prev);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['analytics', user?.uid] });
        },
    });

    return { todayMood: moodQuery.data ?? 0, setMood };
}
