import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsOverview, HabitAnalytics, TrendDataPoint, Insight } from '../services/analytics/AnalyticsService';

export const useAnalytics = (habitId?: string) => {
  const { data: overview, isLoading: isLoadingOverview } = useQuery<AnalyticsOverview | null>({
    queryKey: ['analyticsOverview'],
    queryFn: () => analyticsService.getOverview(),
  });

  const { data: habitAnalytics, isLoading: isLoadingHabitAnalytics } = useQuery<HabitAnalytics | null>({
    queryKey: ['habitAnalytics', habitId],
    queryFn: () => habitId ? analyticsService.getHabitAnalytics(habitId) : null,
    enabled: !!habitId,
  });

  const { data: trends, isLoading: isLoadingTrends } = useQuery<TrendDataPoint[]>({
    queryKey: ['analyticsTrends'],
    queryFn: () => analyticsService.getTrends('30d'), // Default to 30 days
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery<Insight[]>({
    queryKey: ['analyticsInsights'],
    queryFn: () => analyticsService.getInsights(),
  });

  return {
    overview,
    habitAnalytics,
    trends,
    insights,
    isLoading: isLoadingOverview || isLoadingHabitAnalytics || isLoadingTrends || isLoadingInsights,
  };
};
