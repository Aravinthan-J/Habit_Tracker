import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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

    const queryKey = ['completions', user?.id, sd, ed];

    const completionsQuery = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return [];
            try {
                const { data, error } = await supabase
                    .from('completions')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('date', sd)
                    .lte('date', ed);

                if (error) throw error;

                for (const c of data ?? []) {
                    await saveCompletionLocally(c);
                }
                return data ?? [];
            } catch {
                return getLocalCompletions(user.id, sd, ed);
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
                    const { error } = await supabase
                        .from('completions')
                        .delete()
                        .eq('habit_id', habitId)
                        .eq('date', date);
                    if (error) throw error;
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
                    user_id: user.id,
                    date,
                    completed_at: new Date().toISOString(),
                };
                try {
                    const { data, error } = await supabase
                        .from('completions')
                        .insert(newCompletion)
                        .select()
                        .single();
                    if (error) throw error;
                    await saveCompletionLocally(data);
                    return data;
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
        // Optimistic update — checkbox feels instant
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
                    user_id: user?.id ?? '',
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
            qc.invalidateQueries({ queryKey: ['completions', user?.id] });
        },
    });

    return {
        completions: completionsQuery.data ?? [],
        isLoading: completionsQuery.isLoading,
        toggleCompletion,
        refetch: completionsQuery.refetch,
    };
}
