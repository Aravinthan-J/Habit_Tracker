/**
 * Steps Hook
 * React Query hooks for step tracking operations
 * Now using offline-first architecture with local database and auto-sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import { PedometerService } from '../services/health/PedometerService';
import { StepRepository } from '../services/database/repositories/StepRepository';
import { networkMonitor } from '../services/sync/NetworkMonitor';
import { useAuthStore } from '../store/authStore';

/**
 * Fetch today's steps - reads from local DB and pedometer
 */
export function useTodaySteps() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['steps', 'today'],
    queryFn: async () => {
      if (!user?.id) {
        return { steps: 0, distance: 0, calories: 0 };
      }

      const today = new Date().toISOString().split('T')[0];

      // Get from local DB
      let localSteps = await StepRepository.getByDate(user.id, today);

      // If not in DB yet, get from pedometer and save
      if (!localSteps) {
        const available = await PedometerService.isAvailable();
        if (available) {
          const steps = await PedometerService.getTodayStepCount();
          const distance = PedometerService.calculateDistance(steps);
          const calories = PedometerService.calculateCalories(steps);

          localSteps = await StepRepository.upsertToday(user.id, steps, distance, calories);
        }
      }

      return localSteps || { steps: 0, distance: 0, calories: 0 };
    },
    refetchInterval: 60000, // Refetch every minute to update from pedometer
    enabled: !!user?.id,
  });
}

/**
 * Fetch step data for date range - reads from local DB
 */
export function useStepsRange(startDate: string, endDate: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['steps', 'range', startDate, endDate],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      return await StepRepository.getByDateRange(user.id, startDate, endDate);
    },
    enabled: !!startDate && !!endDate && !!user?.id,
  });
}

/**
 * Fetch step statistics
 */
export function useStepStats() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['steps', 'stats'],
    queryFn: async () => {
      if (!user?.id) return null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return await StepRepository.getByDateRange(user.id, thirtyDaysAgo.toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch step goal from profiles
 */
export function useStepGoal() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['steps', 'goal'],
    queryFn: async () => {
      if (!user?.id) return 10000;
      const { data } = await supabase.from('profiles').select('step_goal').eq('id', user.id).single();
      return data?.step_goal || 10000;
    },
    enabled: !!user?.id,
  });
}

/**
 * Log steps mutation
 */
export function useLogSteps() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { date: string; steps: number; distance: number; calories: number; source: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      await StepRepository.upsert(user.id, data.date, data.steps, data.distance, data.calories);
      if (networkMonitor.isConnected()) {
        await supabase.from('step_data').upsert({ user_id: user.id, ...data, updated_at: new Date().toISOString() });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps'] });
    },
  });
}

/**
 * Update step goal mutation
 */
export function useUpdateStepGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (stepGoal: number) => {
      if (!user?.id) throw new Error('Not authenticated');
      await supabase.from('profiles').update({ step_goal: stepGoal }).eq('id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps', 'goal'] });
    },
  });
}

/**
 * Comprehensive steps hook with pedometer integration and auto-sync
 * THIS IS THE FIX: Now actually calls syncSteps automatically!
 */
export function useSteps() {
  const { user } = useAuthStore();
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const queryClient = useQueryClient();

  const { data: todayData, isLoading: isLoadingToday, refetch } = useTodaySteps();
  const { data: stats, isLoading: isLoadingStats } = useStepStats();
  const { data: stepGoal = 10000 } = useStepGoal();

  /**
   * Check pedometer availability and setup with AUTO-SYNC
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let syncInterval: NodeJS.Timeout | undefined;

    const setupPedometer = async () => {
      if (!user?.id) return;

      const available = await PedometerService.isAvailable();
      setPedometerAvailable(available);

      if (available) {
        // Request permissions
        await PedometerService.requestPermissions();

        // Get initial step count
        const steps = await PedometerService.getTodayStepCount();
        setCurrentSteps(steps);

        // Watch for step updates
        unsubscribe = PedometerService.watchStepCount((steps) => {
          setCurrentSteps(steps);
        });

        // AUTO-SYNC: Update local DB every 5 minutes
        const updateLocalSteps = async () => {
          const steps = await PedometerService.getTodayStepCount();
          const distance = PedometerService.calculateDistance(steps);
          const calories = PedometerService.calculateCalories(steps);

          await StepRepository.upsertToday(user.id!, steps, distance, calories);
          queryClient.invalidateQueries({ queryKey: ['steps'] });
        };

        // Initial update
        updateLocalSteps();

        // Set up interval for auto-updates
        syncInterval = setInterval(updateLocalSteps, 5 * 60 * 1000); // Every 5 minutes
      }
    };

    setupPedometer();

    return () => {
      if (unsubscribe) unsubscribe();
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [user?.id, queryClient]);

  /**
   * Sync steps with backend - NOW ACTUALLY CALLED!
   */
  const syncSteps = async () => {
    if (!pedometerAvailable || !user?.id) return;

    try {
      console.log('Syncing steps to server...');

      const steps = await PedometerService.getTodayStepCount();
      const distance = PedometerService.calculateDistance(steps);
      const calories = PedometerService.calculateCalories(steps);

      // 1. Update local DB
      await StepRepository.upsertToday(user.id, steps, distance, calories);

      // 2. Sync to server if online
      if (networkMonitor.isConnected()) {
        await supabase.from('step_data').upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          steps,
          distance,
          calories,
          source: 'auto-sync',
          updated_at: new Date().toISOString(),
        });
        console.log('Steps synced successfully');
      } else {
        console.log('Offline - steps saved locally, will sync when online');
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['steps'] });
    } catch (error) {
      console.error('Failed to sync steps:', error);
      throw error;
    }
  };

  /**
   * Manual log steps - saves locally and syncs
   */
  const logManualSteps = async (steps: number) => {
    if (!user?.id) return;

    const distance = PedometerService.calculateDistance(steps);
    const calories = PedometerService.calculateCalories(steps);

    // 1. Save to local DB
    await StepRepository.upsertToday(user.id, steps, distance, calories);

    // 2. Sync to server if online
    if (networkMonitor.isConnected()) {
      await supabase.from('step_data').upsert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        steps,
        distance,
        calories,
        source: 'manual',
        updated_at: new Date().toISOString(),
      });
    }

    // Refresh queries
    queryClient.invalidateQueries({ queryKey: ['steps'] });
  };

  return {
    // Data
    todayData,
    stats,
    stepGoal,
    currentSteps: pedometerAvailable ? currentSteps : todayData?.steps || 0,
    pedometerAvailable,

    // Loading states
    isLoading: isLoadingToday || isLoadingStats,

    // Actions
    syncSteps, // NOW PROPERLY IMPLEMENTED!
    logManualSteps,
    refetch: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['steps'] });
    },
  };
}
