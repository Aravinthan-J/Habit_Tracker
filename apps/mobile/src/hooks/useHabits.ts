/**
 * Habits Hook
 * React Query hooks for habit operations
 * Now using offline-first architecture with local database
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';
import { HabitRepository } from '../services/database/repositories/HabitRepository';
import { SyncQueueRepository } from '../services/database/repositories/SyncQueueRepository';
import { syncService } from '../services/sync/SyncService';
import { networkMonitor } from '../services/sync/NetworkMonitor';
import { useAuthStore } from '../store/authStore';
import type { Habit, CreateHabitData, UpdateHabitData } from '@habit-tracker/shared-types';

type LocalHabit = Awaited<ReturnType<typeof HabitRepository.getAll>>[number];

/**
/**
 * Fetch all habits - reads from local DB first, syncs in background
 */
export function useHabits(): ReturnType<typeof useQuery> {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      // Read from local DB (refresh on every mount to get latest data)
      const localHabits = await HabitRepository.getAll(user.id);
      console.log(`📚 useHabits: loaded ${localHabits.length} habits from DB`);
      return localHabits;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fresh, refetch when component mounts
    gcTime: 60000, // Keep in cache for 1 minute
  });
}

/**
/**
 * Fetch single habit by ID - reads from local DB
 */
export function useHabit(habitId: string): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['habits', habitId],
    queryFn: async () => {
      const localHabit = await HabitRepository.getById(habitId);
      return localHabit;
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
/**
 * Create new habit - writes to local DB first, syncs in background
 */
export function useCreateHabit(): UseMutationResult<LocalHabit, unknown, CreateHabitData, unknown> {
  const queryClient = useQueryClient();
  const { user } = useAuthStore() as { user: { id: string } | null };

  return useMutation<LocalHabit, unknown, CreateHabitData>({
    mutationFn: async (data: CreateHabitData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate ID locally
      const habitId = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 1. Write to local DB (instant)
      const habit = await HabitRepository.create(user.id, { ...data, id: habitId });

      // 2. Queue for sync
      await SyncQueueRepository.add('habit', 'create', data, habitId);

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        syncService.syncEntity('habit', habitId).catch(console.error);
      }

      return habit;
    },
    onSuccess: () => {
      // Invalidate habits list to refetch from local DB
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

/**
/**
 * Update habit - writes to local DB first, syncs in background
 */
export function useUpdateHabit(): ReturnType<typeof useMutation<any, unknown, { habitId: string; data: UpdateHabitData }>> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, data }: { habitId: string; data: UpdateHabitData }) => {
      // 1. Write to local DB (instant)
      await HabitRepository.update(habitId, data);

      // 2. Queue for sync
      await SyncQueueRepository.add('habit', 'update', data, habitId);

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        syncService.syncEntity('habit', habitId).catch(console.error);
      }

      // Return updated habit
      return await HabitRepository.getById(habitId);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific habit and habits list
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', variables.habitId] });
    },
  });
}

/**
 * Delete habit - soft deletes in local DB, syncs in background
 */
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      // 1. Soft delete in local DB (instant)
      await HabitRepository.delete(habitId);

      // 2. Queue for sync
      await SyncQueueRepository.add('habit', 'delete', { habitId }, habitId);

      // 3. Try immediate sync if online
      if (networkMonitor.isConnected()) {
        api.habits.delete(habitId).catch(console.error);
      }
    },
    onSuccess: () => {
      // Invalidate habits list
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
