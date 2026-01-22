/**
 * Steps Hook
 * React Query hooks for step tracking operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../services/api/apiClient';
import { PedometerService } from '../services/health/PedometerService';
import type { LogStepsData } from '@habit-tracker/api-client';

/**
 * Fetch today's steps
 */
export function useTodaySteps() {
  return useQuery({
    queryKey: ['steps', 'today'],
    queryFn: async () => {
      return await api.steps.getTodaySteps();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch step data for date range
 */
export function useStepsRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['steps', 'range', startDate, endDate],
    queryFn: async () => {
      return await api.steps.getSteps(startDate, endDate);
    },
    enabled: !!startDate && !!endDate,
  });
}

/**
 * Fetch step statistics
 */
export function useStepStats() {
  return useQuery({
    queryKey: ['steps', 'stats'],
    queryFn: async () => {
      return await api.steps.getStats();
    },
  });
}

/**
 * Fetch step goal
 */
export function useStepGoal() {
  return useQuery({
    queryKey: ['steps', 'goal'],
    queryFn: async () => {
      return await api.steps.getStepGoal();
    },
  });
}

/**
 * Log steps mutation
 */
export function useLogSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LogStepsData) => {
      return await api.steps.logSteps(data);
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

  return useMutation({
    mutationFn: async (stepGoal: number) => {
      return await api.steps.updateStepGoal(stepGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps', 'goal'] });
    },
  });
}

/**
 * Comprehensive steps hook with pedometer integration
 */
export function useSteps() {
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const queryClient = useQueryClient();

  const { data: todayData, isLoading: isLoadingToday, refetch } = useTodaySteps();
  const { data: stats, isLoading: isLoadingStats } = useStepStats();
  const { data: stepGoal = 10000 } = useStepGoal();
  const logStepsMutation = useLogSteps();

  /**
   * Check pedometer availability and setup
   */
  useEffect(() => {
    const setupPedometer = async () => {
      const available = await PedometerService.isAvailable();
      setPedometerAvailable(available);

      if (available) {
        // Request permissions
        await PedometerService.requestPermissions();

        // Get initial step count
        const steps = await PedometerService.getTodayStepCount();
        setCurrentSteps(steps);

        // Watch for step updates
        const unsubscribe = PedometerService.watchStepCount((steps) => {
          setCurrentSteps(steps);
        });

        return unsubscribe;
      }
    };

    setupPedometer();
  }, []);

  /**
   * Sync steps with backend
   */
  const syncSteps = async () => {
    if (!pedometerAvailable) return;

    const steps = await PedometerService.getTodayStepCount();
    const distance = PedometerService.calculateDistance(steps);
    const calories = PedometerService.calculateCalories(steps);
    const activeMinutes = PedometerService.calculateActiveMinutes(steps);

    await logStepsMutation.mutateAsync({
      date: new Date().toISOString().split('T')[0],
      steps,
      distance,
      calories,
      activeMinutes,
      source: 'pedometer',
    });
  };

  /**
   * Manual log steps
   */
  const logManualSteps = async (steps: number) => {
    const distance = PedometerService.calculateDistance(steps);
    const calories = PedometerService.calculateCalories(steps);
    const activeMinutes = PedometerService.calculateActiveMinutes(steps);

    await logStepsMutation.mutateAsync({
      date: new Date().toISOString().split('T')[0],
      steps,
      distance,
      calories,
      activeMinutes,
      source: 'manual',
    });
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
    syncSteps,
    logManualSteps,
    refetch: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['steps'] });
    },
  };
}
