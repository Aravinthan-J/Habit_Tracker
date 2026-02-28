import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HabitRepository, Habit } from '../db/habit.repository';

export const useHabits = () => {
    const queryClient = useQueryClient();

    const habitsQuery = useQuery({
        queryKey: ['habits'],
        queryFn: () => HabitRepository.getAll(),
    });

    const createHabit = useMutation({
        mutationFn: (habit: Habit) => Promise.resolve(HabitRepository.create(habit)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        },
    });

    const updateHabit = useMutation({
        mutationFn: (habit: Partial<Habit> & { id: string }) =>
            Promise.resolve(HabitRepository.update(habit)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        },
    });

    const deleteHabit = useMutation({
        mutationFn: (id: string) => Promise.resolve(HabitRepository.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        },
    });

    const archiveHabit = useMutation({
        mutationFn: (id: string) => Promise.resolve(HabitRepository.archive(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        },
    });

    return {
        habits: habitsQuery.data ?? [],
        isLoading: habitsQuery.isLoading,
        createHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
    };
};
