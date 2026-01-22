/**
 * Completions Hook
 * React Query hooks for habit completion operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';

/**
 * Fetch completions with optional filters
 */
export function useCompletions(filters?: {
  habitId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['completions', filters],
    queryFn: async () => {
      const response = await api.completions.getAll(filters);
      return response;
    },
  });
}

/**
 * Fetch today's completions
 */
export function useTodayCompletions() {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['completions', 'today', today],
    queryFn: async () => {
      const response = await api.completions.getAll({
        startDate: today,
        endDate: today,
      });
      return response;
    },
  });
}

/**
 * Fetch calendar completions for a month
 */
export function useCalendarCompletions(year: number, month: number) {
  return useQuery({
    queryKey: ['completions', 'calendar', year, month],
    queryFn: async () => {
      const response = await api.completions.getCalendar(year, month);
      return response;
    },
  });
}

/**
 * Toggle habit completion (mark complete or uncomplete)
 */
export function useToggleCompletion() {
  const queryClient = useQueryClient();

  const markComplete = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      return await api.completions.create({ habitId, date });
    },
    onSuccess: () => {
      // Invalidate all completion queries and habit stats
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const unmarkComplete = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      return await api.completions.delete(habitId, date);
    },
    onSuccess: () => {
      // Invalidate all completion queries and habit stats
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    markComplete: markComplete.mutateAsync,
    unmarkComplete: unmarkComplete.mutateAsync,
    isLoading: markComplete.isPending || unmarkComplete.isPending,
  };
}

/**
 * Mark habit complete for specific date
 */
export function useMarkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      return await api.completions.create({ habitId, date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

/**
 * Unmark habit completion
 */
export function useUnmarkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      return await api.completions.delete(habitId, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
