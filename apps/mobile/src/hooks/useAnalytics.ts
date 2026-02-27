/**
 * Analytics Hook
 * Computes analytics from local SQLite (no backend needed)
 */

import { useQuery } from '@tanstack/react-query';
import { CompletionRepository } from '../services/database/repositories/CompletionRepository';
import { HabitRepository } from '../services/database/repositories/HabitRepository';
import { useAuthStore } from '../store/authStore';

export function useOverviewStats() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      if (!user?.id) return null;
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [habits, completions] = await Promise.all([
        HabitRepository.getAll(user.id),
        CompletionRepository.getByDateRange(user.id, thirtyDaysAgo, today),
      ]);

      const totalCompletions = completions.length;
      const activeHabits = habits.length;
      const completionRate = activeHabits > 0
        ? Math.round((totalCompletions / (activeHabits * 30)) * 100)
        : 0;

      return {
        totalCompletions,
        activeHabits,
        completionRate,
        averageCompletionRate: completionRate,
        totalHabits: habits.length,
        currentStreaks: 0,
        totalBadges: 0,
      };
    },
    enabled: !!user?.id,
  });
}

export function useTrends(period: number = 30) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['analytics', 'trends', period],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - period);

      const completions = await CompletionRepository.getByDateRange(
        user.id,
        startDate.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Group completions by date
      const byDate: Record<string, number> = {};
      completions.forEach(c => {
        byDate[c.date] = (byDate[c.date] || 0) + 1;
      });

      // Build trend array for each day
      const trends = [];
      for (let i = period - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        trends.push({ date: dateStr, count: byDate[dateStr] || 0 });
      }

      return trends;
    },
    enabled: !!user?.id,
  });
}

export function useInsights() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const completions = await CompletionRepository.getByDateRange(user.id, thirtyDaysAgo, today);
      const insights = [];

      if (completions.length > 20) {
        insights.push({ type: 'positive', message: 'Great consistency this month! Keep it up.' });
      } else if (completions.length < 5) {
        insights.push({ type: 'suggestion', message: 'Try completing at least one habit daily to build momentum.' });
      }

      return insights;
    },
    enabled: !!user?.id,
  });
}

export function useAnalytics(period: number = 30) {
  const { data: overview, isLoading: isLoadingOverview, refetch: refetchOverview } = useOverviewStats();
  const { data: trends = [], isLoading: isLoadingTrends, refetch: refetchTrends } = useTrends(period);
  const { data: insights = [], isLoading: isLoadingInsights, refetch: refetchInsights } = useInsights();

  return {
    overview,
    trends,
    insights,
    isLoading: isLoadingOverview || isLoadingTrends || isLoadingInsights,
    refetch: () => { refetchOverview(); refetchTrends(); refetchInsights(); },
  };
}
