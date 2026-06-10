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
    logCompletionTime,
    deleteCompletionTimeLog,
} from '@/services/storage/LocalStorageService';
import {
    cancelSmartReminderOccurrence,
    sendImmediateNotification,
} from '@/services/notifications/NotificationService';
import { Completion, Habit } from '@/types/habit.types';

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

    // Habit stacking: when a habit is completed, nudge the habits stacked after it
    const nudgeStackedHabits = async (habitId: string, date: string) => {
        const habits = qc.getQueryData<Habit[]>(['habits', user?.uid]) ?? [];
        const completed = habits.find((h) => h.id === habitId);
        if (!completed) return;

        const doneToday = new Set(
            (qc.getQueryData<Completion[]>(queryKey) ?? [])
                .filter((c) => c.date === date)
                .map((c) => c.habit_id)
        );
        doneToday.add(habitId);

        for (const next of habits) {
            if (next.stack_after === habitId && !doneToday.has(next.id)) {
                await sendImmediateNotification(
                    '⛓️ Keep the chain going',
                    `"${completed.title}" done! Next up: "${next.title}"`
                ).catch(() => { });
            }
        }
    };

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
                await deleteCompletionTimeLog(habitId, date).catch(() => { });
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

                if (date === today()) {
                    const now = new Date();
                    // Feed the smart-reminder pattern and skip today's reminder
                    await logCompletionTime(habitId, user.uid, date, now.getHours() * 60 + now.getMinutes()).catch(() => { });
                    await cancelSmartReminderOccurrence(habitId, date);
                    await nudgeStackedHabits(habitId, date);
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
