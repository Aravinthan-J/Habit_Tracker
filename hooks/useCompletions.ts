import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    setDoc,
    doc,
    documentId,
} from 'firebase/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { today, formatDate } from '@/utils/dateHelpers';
import {
    saveCompletionLocally,
    deleteCompletionLocally,
    getLocalCompletions,
    queueOperation,
} from '@/services/storage/LocalStorageService';
import { Completion } from '@/types/habit.types';

function dailyDocsToCompletions(
    docs: { date: string; completedHabitIds: string[] }[],
    userId: string
): Completion[] {
    const result: Completion[] = [];
    for (const d of docs) {
        for (const habitId of d.completedHabitIds ?? []) {
            result.push({
                id: `${habitId}_${d.date}`,
                habit_id: habitId,
                user_id: userId,
                date: d.date,
                completed_at: `${d.date}T00:00:00.000Z`,
            });
        }
    }
    return result;
}

export function useCompletions(startDate?: string, endDate?: string) {
    const { user } = useAuthStore();
    const sd = startDate ?? formatDate(new Date(Date.now() - 30 * 86400000));
    const ed = endDate ?? today();
    const qc = useQueryClient();

    const queryKey = ['completions', user?.uid, sd, ed];

    const completionsQuery = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return [];
            try {
                const q = query(
                    collection(db, 'users', user.uid, 'daily'),
                    where(documentId(), '>=', sd),
                    where(documentId(), '<=', ed)
                );
                const snapshot = await getDocs(q);
                const dailyDocs = snapshot.docs.map((d) => ({
                    date: d.id,
                    completedHabitIds: (d.data().completedHabitIds ?? []) as string[],
                }));

                const completions = dailyDocsToCompletions(dailyDocs, user.uid);
                for (const c of completions) {
                    await saveCompletionLocally(c);
                }
                return completions;
            } catch {
                return getLocalCompletions(user.uid, sd, ed);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 15,
    });

    const toggleCompletion = useMutation({
        mutationFn: async ({
            habitId,
            date,
            isCompleted,
        }: {
            habitId: string;
            date: string;
            isCompleted: boolean;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const dailyRef = doc(db, 'users', user.uid, 'daily', date);

            if (isCompleted) {
                try {
                    await updateDoc(dailyRef, { completedHabitIds: arrayRemove(habitId) });
                } catch {
                    await queueOperation({
                        operation: 'ARRAY_REMOVE',
                        table_name: 'daily',
                        record_id: date,
                        payload: JSON.stringify({ habitId }),
                    });
                }
                await deleteCompletionLocally(habitId, date);
            } else {
                const completed_at = new Date().toISOString();
                const newCompletion: Completion = {
                    id: `${habitId}_${date}`,
                    habit_id: habitId,
                    user_id: user.uid,
                    date,
                    completed_at,
                };
                try {
                    await setDoc(dailyRef, { completedHabitIds: arrayUnion(habitId) }, { merge: true });
                    await saveCompletionLocally(newCompletion);
                } catch {
                    await saveCompletionLocally(newCompletion);
                    await queueOperation({
                        operation: 'ARRAY_UNION',
                        table_name: 'daily',
                        record_id: date,
                        payload: JSON.stringify({ habitId }),
                    });
                }
            }
        },
        onMutate: async ({ habitId, date, isCompleted }) => {
            await qc.cancelQueries({ queryKey });
            const prev = qc.getQueryData<Completion[]>(queryKey) ?? [];

            qc.setQueryData<Completion[]>(queryKey, (old = []) => {
                if (isCompleted) {
                    return old.filter((c) => !(c.habit_id === habitId && c.date === date));
                }
                return [...old, {
                    id: `${habitId}_${date}`,
                    habit_id: habitId,
                    user_id: user?.uid ?? '',
                    date,
                    completed_at: new Date().toISOString(),
                }];
            });

            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['completions', user?.uid] });
        },
    });

    return {
        completions: completionsQuery.data ?? [],
        isLoading: completionsQuery.isLoading,
        toggleCompletion,
        refetch: completionsQuery.refetch,
    };
}
