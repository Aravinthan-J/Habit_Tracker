import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { today, formatDate } from '@/utils/dateHelpers';
import {
    saveCompletionLocally,
    deleteCompletionLocally,
    getLocalCompletions,
    generateId,
    queueOperation,
} from '@/services/storage/LocalStorageService';
import { Completion } from '@/types/habit.types';

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
                    collection(db, 'users', user.uid, 'completions'),
                    where('date', '>=', sd),
                    where('date', '<=', ed)
                );
                const snapshot = await getDocs(q);
                const data: Completion[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Completion));

                for (const c of data) {
                    await saveCompletionLocally(c);
                }
                return data;
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

            if (isCompleted) {
                try {
                    // Find and delete the Firestore document
                    const q = query(
                        collection(db, 'users', user.uid, 'completions'),
                        where('habit_id', '==', habitId),
                        where('date', '==', date)
                    );
                    const snapshot = await getDocs(q);
                    for (const d of snapshot.docs) {
                        await deleteDoc(doc(db, 'users', user.uid, 'completions', d.id));
                    }
                } catch {
                    await queueOperation({
                        operation: 'DELETE',
                        table_name: 'completions',
                        record_id: `${habitId}-${date}`,
                        payload: JSON.stringify({ habit_id: habitId, date }),
                    });
                }
                await deleteCompletionLocally(habitId, date);
            } else {
                const newCompletion: Completion = {
                    id: generateId(),
                    habit_id: habitId,
                    user_id: user.uid,
                    date,
                    completed_at: new Date().toISOString(),
                };
                try {
                    const docRef = await addDoc(
                        collection(db, 'users', user.uid, 'completions'),
                        {
                            habit_id: habitId,
                            user_id: user.uid,
                            date,
                            completed_at: newCompletion.completed_at,
                        }
                    );
                    const saved = { ...newCompletion, id: docRef.id };
                    await saveCompletionLocally(saved);
                    return saved;
                } catch {
                    await saveCompletionLocally(newCompletion);
                    await queueOperation({
                        operation: 'INSERT',
                        table_name: 'completions',
                        record_id: newCompletion.id,
                        payload: JSON.stringify(newCompletion),
                    });
                    return newCompletion;
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
                    id: `optimistic-${habitId}-${date}`,
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
