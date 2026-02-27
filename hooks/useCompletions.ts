import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { today, formatDate } from '@/utils/dateHelpers';
import {
    saveCompletionLocally,
    deleteCompletionLocally,
    getLocalCompletions,
    queueOperation,
} from '@/services/storage/LocalStorageService';

export function useCompletions(startDate?: string, endDate?: string) {
    const { user } = useAuthStore();
    const sd = startDate ?? formatDate(new Date(Date.now() - 30 * 86400000));
    const ed = endDate ?? today();
    const qc = useQueryClient();

    const completionsQuery = useQuery({
        queryKey: ['completions', user?.id, sd, ed],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('completions')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', sd)
                .lte('date', ed);

            if (error) {
                return await getLocalCompletions(user.id, sd, ed);
            }

            for (const c of data ?? []) {
                await saveCompletionLocally(c);
            }
            return data ?? [];
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
                // Un-complete: delete
                const { error } = await supabase
                    .from('completions')
                    .delete()
                    .eq('habit_id', habitId)
                    .eq('date', date);
                if (error) throw error;
                await deleteCompletionLocally(habitId, date);
            } else {
                // Complete: insert
                const newCompletion = {
                    habit_id: habitId,
                    user_id: user.id,
                    date,
                    completed_at: new Date().toISOString(),
                };
                const { data, error } = await supabase
                    .from('completions')
                    .insert(newCompletion)
                    .select()
                    .single();
                if (error) throw error;
                if (data) await saveCompletionLocally(data);
                return data;
            }
        },
        onSuccess: () => {
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
