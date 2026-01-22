/**
 * Analytics Hook
 * React Query hooks for analytics operations
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';

/**
 * Fetch overview statistics
 */
export function useOverviewStats() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      return await api.analytics.getOverview();
    },
  });
}

/**
 * Fetch completion trends
 */
export function useTrends(period: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'trends', period],
    queryFn: async () => {
      return await api.analytics.getTrends(period);
    },
  });
}

/**
 * Fetch insights
 */
export function useInsights() {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async () => {
      return await api.analytics.getInsights();
    },
  });
}

/**
 * Comprehensive analytics hook
 */
export function useAnalytics(period: number = 30) {
  const {
    data: overview,
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
  } = useOverviewStats();

  const {
    data: trends = [],
    isLoading: isLoadingTrends,
    refetch: refetchTrends,
  } = useTrends(period);

  const {
    data: insights = [],
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
  } = useInsights();

  return {
    overview,
    trends,
    insights,
    isLoading: isLoadingOverview || isLoadingTrends || isLoadingInsights,
    refetch: () => {
      refetchOverview();
      refetchTrends();
      refetchInsights();
    },
  };
}
