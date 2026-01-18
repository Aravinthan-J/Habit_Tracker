import { apiClient } from '../../utils/apiClient';

export interface AnalyticsOverview {
  totalActiveHabits: number;
  totalCompletionsThisMonth: number;
  monthlyCompletionChange: number; // Percentage change
  activeStreaks: number;
  averageCompletionRate: number;
}

export interface HabitAnalytics {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  // Further details like monthly data can be added
}

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD
  completionPercentage: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}

class AnalyticsService {
  public async getOverview(): Promise<AnalyticsOverview | null> {
    try {
      const response = await apiClient.get<AnalyticsOverview>('/analytics/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      return null;
    }
  }

  public async getHabitAnalytics(habitId: string): Promise<HabitAnalytics | null> {
    try {
      const response = await apiClient.get<HabitAnalytics>(`/analytics/habits/${habitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for habit ${habitId}:`, error);
      return null;
    }
  }

  public async getTrends(period: '7d' | '30d' | '90d' | 'year'): Promise<TrendDataPoint[]> {
    try {
      const response = await apiClient.get<TrendDataPoint[]>('/analytics/trends', { params: { period } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics trends for period ${period}:`, error);
      return [];
    }
  }

  public async getInsights(): Promise<Insight[]> {
    try {
      const response = await apiClient.get<Insight[]>('/analytics/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics insights:', error);
      return [];
    }
  }

  public async getStepCorrelation(): Promise<any> { // Define a proper interface for correlation data
    try {
      const response = await apiClient.get('/analytics/correlation');
      return response.data;
    } catch (error) {
      console.error('Error fetching step correlation data:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
