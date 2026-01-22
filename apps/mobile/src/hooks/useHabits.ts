/**
 * Habits Hook
 * React Query hooks for habit operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';
import type { Habit, CreateHabitData, UpdateHabitData } from '@habit-tracker/shared-types';

/**
 * Fetch all habits
 */
export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await api.habits.getAll();
      return response;
    },
  });
}

/**
 * Fetch single habit by ID
 */
export function useHabit(habitId: string) {
  return useQuery({
    queryKey: ['habits', habitId],
    queryFn: async () => {
      const response = await api.habits.getById(habitId);
      return response;
    },
    enabled: !!habitId,
  });
}

/**
 * Get habit statistics
 */
export function useHabitStats(habitId: string) {
  return useQuery({
    queryKey: ['habits', habitId, 'stats'],
    queryFn: async () => {
      const response = await api.habits.getStats(habitId);
      return response;
    },
    enabled: !!habitId,
  });
}

/**
 * Create new habit
 */
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHabitData) => {
      return await api.habits.create(data);
    },
    onSuccess: () => {
      // Invalidate habits list to refetch
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

/**
 * Update habit
 */
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, data }: { habitId: string; data: UpdateHabitData }) => {
      return await api.habits.update(habitId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific habit and habits list
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', variables.habitId] });
    },
  });
}

/**
 * Delete habit
 */
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      return await api.habits.delete(habitId);
    },
    onSuccess: () => {
      // Invalidate habits list
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
