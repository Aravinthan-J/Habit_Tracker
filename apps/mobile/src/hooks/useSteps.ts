import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pedometerService } from '../services/health/PedometerService';
import { useStepStore } from '../store/stepStore';
import { manualStepService } from '../services/health/ManualStepService';

export const useSteps = () => {
  const { dailyStepGoal, setDailyStepGoal } = useStepStore();
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  
  // Fetch today's steps
  const { data: todaySteps, isLoading: isLoadingTodaySteps } = useQuery({
    queryKey: ['todaySteps'],
    queryFn: async () => {
      const steps = await pedometerService.getDailySteps(new Date());
      return steps?.steps || pedometerService.getCurrentDaySteps() || 0;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch step data for a range (e.g., last 7 days)
  const { data: weeklySteps, isLoading: isLoadingWeeklySteps } = useQuery({
    queryKey: ['weeklySteps'],
    queryFn: async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      
      const stepData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dailyData = await pedometerService.getDailySteps(date);
        stepData.push({ date, steps: dailyData?.steps || 0 });
      }
      return stepData;
    },
  });

  useEffect(() => {
    pedometerService.isAvailable().then(setIsPedometerAvailable);
    pedometerService.startTracking();

    return () => {
      pedometerService.stopTracking();
    };
  }, []);

  const logManualSteps = async (date: Date, steps: number) => {
    await manualStepService.logManualSteps(date, steps);
    // Invalidate queries to refetch after manual logging
  };

  return {
    todaySteps: todaySteps ?? 0,
    dailyStepGoal,
    setDailyStepGoal,
    weeklySteps,
    isPedometerAvailable,
    isLoading: isLoadingTodaySteps || isLoadingWeeklySteps,
    logManualSteps,
  };
};
