/**
 * Completions Hook
 * React Query hooks for habit completion operations
 * Now using offline-first architecture with local database
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';
import { CompletionRepository } from '../services/database/repositories/CompletionRepository';
import { SyncQueueRepository } from '../services/database/repositories/SyncQueueRepository';
import { syncService } from '../services/sync/SyncService';
import { networkMonitor } from '../services/sync/NetworkMonitor';
import { useAuthStore } from '../store/authStore';
import { useCheckBadges } from './useBadges';

/**
 * Fetch completions with optional filters - reads from local DB
 */
export function useCompletions(filters?: {
  habitId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['completions', filters],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      // Read from local DB based on filters
      if (filters?.habitId && filters?.startDate && filters?.endDate) {
        return await CompletionRepository.getByHabitAndDateRange(
          filters.habitId,
          filters.startDate,
          filters.endDate
        );
      } else if (filters?.startDate && filters?.endDate) {
        return await CompletionRepository.getByDateRange(
          user.id,
          filters.startDate,
          filters.endDate
        );
      } else if (filters?.habitId) {
        return await CompletionRepository.getByHabitId(filters.habitId);
      }

      // Default: get last 30 days
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return await CompletionRepository.getByDateRange(user.id, thirtyDaysAgo, today);
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch today's completions - reads from local DB
 */
export function useTodayCompletions() {
  const { user } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['completions', 'today', today],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      return await CompletionRepository.getByDate(user.id, today);
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch calendar completions for a month
 */
export function useCalendarCompletions(year: number, month: number) {
  return useQuery({
    queryKey: ['completions', 'calendar', year, month],
    queryFn: async () => {
      const response = await api.completions.getMonthlyCalendar(year, month);
      return response;
    },
  });
}

/**
 * Toggle habit completion (mark complete or uncomplete)
 * Now with instant local update and background sync
 */
export function useToggleCompletion() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { mutate: checkBadges } = useCheckBadges();

  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Toggling completion locally', { habitId, date });

      // Generate completion ID
      const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 1. Toggle in local DB (instant)
      const isCompleted = await CompletionRepository.toggle(user.id, habitId, date, completionId);

      // 2. Queue for sync
      if (isCompleted) {
        await SyncQueueRepository.add('completion', 'create', { habitId, date }, completionId);
      } else {
        await SyncQueueRepository.add('completion', 'delete', { habitId, date });
      }

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        try {
          if (isCompleted) {
            await api.completions.create({ habitId, date });
          } else {
            await api.completions.delete(habitId, date);
          }
          console.log('Completion synced to server');
        } catch (error) {
          console.error('Failed to sync completion immediately:', error);
        }
      }

      return isCompleted;
    },
    onSuccess: (isCompleted, variables) => {
      console.log('Toggle completion success, completed:', isCompleted);

      // Invalidate all completion queries and habit stats
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });

      // Check for badge unlocks only when marking complete
      if (isCompleted) {
        checkBadges(variables.habitId);
      }
    },
    onError: (error: any) => {
      console.error('Toggle completion error', error);
    },
  });

  return {
    markComplete: async ({ habitId, date }: { habitId: string; date: string }) => {
      return toggleMutation.mutateAsync({ habitId, date });
    },
    unmarkComplete: async ({ habitId, date }: { habitId: string; date: string }) => {
      return toggleMutation.mutateAsync({ habitId, date });
    },
    isLoading: toggleMutation.isPending,
  };
}

/**
 * Mark habit complete for specific date - instant local update
 */
export function useMarkComplete() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { mutate: checkBadges } = useCheckBadges();

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 1. Write to local DB (instant)
      const completion = await CompletionRepository.create(user.id, { id: completionId, habitId, date });

      // 2. Queue for sync
      await SyncQueueRepository.add('completion', 'create', { habitId, date }, completionId);

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        api.completions.create({ habitId, date }).catch(console.error);
      }

      return completion;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });

      // Check for badge unlocks
      checkBadges(variables.habitId);
    },
  });
}

/**
 * Unmark habit completion - instant local update
 */
export function useUnmarkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      // 1. Delete from local DB (instant)
      await CompletionRepository.delete(habitId, date);

      // 2. Queue for sync
      await SyncQueueRepository.add('completion', 'delete', { habitId, date });

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        api.completions.delete(habitId, date).catch(console.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
