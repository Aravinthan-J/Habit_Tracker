/**
 * Completions Hook
 * React Query hooks for habit completion operations
 * Now using offline-first architecture with local database
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/supabaseClient';
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
 * Fetch calendar completions for a month - reads from local DB for instant load
 */
export function useCalendarCompletions(year: number, month: number) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['completions', 'calendar', year, month],
    queryFn: async () => {
      if (!user?.id) {
        return { completions: [] };
      }

      // Get first and last day of the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      // Read from local DB for fast loading
      const completions = await CompletionRepository.getByDateRange(user.id, startDate, endDate);

      return { completions };
    },
    enabled: !!user?.id,
    staleTime: 30000, // Keep fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
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
      const completedAt = new Date().toISOString();
      if (isCompleted) {
        await SyncQueueRepository.add('completion', 'create', { habitId, date, completedAt }, completionId);
      } else {
        await SyncQueueRepository.add('completion', 'delete', { habitId, date });
      }

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        try {
          if (isCompleted) {
            await supabase.from('completions').upsert({ id: completionId, habit_id: habitId, user_id: user.id, date, completed_at: completedAt });
          } else {
            await supabase.from('completions').delete().eq('habit_id', habitId).eq('date', date);
          }
          console.log('Completion synced to Supabase');
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
        supabase.from('completions').upsert({ id: completionId, habit_id: habitId, user_id: user.id, date, completed_at: new Date().toISOString() }).then(({ error }) => { if (error) console.error(error); });
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
        supabase.from('completions').delete().eq('habit_id', habitId).eq('date', date).then(({ error }) => { if (error) console.error(error); });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
