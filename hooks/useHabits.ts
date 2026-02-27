import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Habit, HabitInsert, HabitUpdate } from '@/types/habit.types';
import {
    saveHabitLocally,
    getLocalHabits,
    deleteLocalHabit,
    queueOperation,
} from '@/services/storage/LocalStorageService';

export function useHabits() {
    const { user } = useAuthStore();
    const qc = useQueryClient();

    const habitsQuery = useQuery({
        queryKey: ['habits', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .is('archived_at', null)
                .order('created_at', { ascending: false });

            if (error) {
                // Fall back to local cache
                return await getLocalHabits(user.id);
            }

            // Cache locally
            for (const habit of data ?? []) {
                await saveHabitLocally(habit);
            }
            return data ?? [];
        },
        enabled: !!user,
        staleTime: 1000 * 30,
    });

    const createHabit = useMutation({
        mutationFn: async (input: Omit<HabitInsert, 'user_id'>) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('habits')
                .insert({ ...input, user_id: user.id })
                .select()
                .single();

            if (error) {
                // Queue for sync if offline
                await queueOperation({
                    operation: 'INSERT',
                    table_name: 'habits',
                    record_id: 'pending',
                    payload: JSON.stringify({ ...input, user_id: user.id }),
                });
                throw error;
            }

            if (data) await saveHabitLocally(data);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    });

    const updateHabit = useMutation({
        mutationFn: async ({ id, ...updates }: HabitUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('habits')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (data) await saveHabitLocally(data);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    });

    const archiveHabit = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('habits')
                .update({ archived_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            await deleteLocalHabit(id);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    });

    const deleteHabit = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('habits').delete().eq('id', id);
            if (error) throw error;
            await deleteLocalHabit(id);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.id] }),
    });

    return {
        habits: habitsQuery.data ?? [],
        isLoading: habitsQuery.isLoading,
        error: habitsQuery.error,
        createHabit,
        updateHabit,
        archiveHabit,
        deleteHabit,
        refetch: habitsQuery.refetch,
    };
}
