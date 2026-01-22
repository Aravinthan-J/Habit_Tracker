/**
 * Analytics API Service
 * Handles analytics-related API calls
 */

import { AxiosInstance } from 'axios';
import type { ApiResponse } from '@habit-tracker/shared-types';

export interface OverviewStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  averageCompletionRate: number;
  currentStreaks: number;
  totalBadges: number;
}

export interface TrendData {
  date: string;
  completionRate: number;
  completedCount: number;
  totalHabits: number;
}

export interface Insight {
  type: string;
  message: string;
  icon: string;
  priority: number;
}

export class AnalyticsApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Get overview statistics
   */
  async getOverview(): Promise<OverviewStats> {
    const response = await this.api.get<ApiResponse<OverviewStats>>(
      '/analytics/overview'
    );
    return response.data.data!;
  }

  /**
   * Get completion trends
   */
  async getTrends(period: number = 30): Promise<TrendData[]> {
    const response = await this.api.get<ApiResponse<{ trends: TrendData[]; count: number }>>(
      '/analytics/trends',
      {
        params: { period },
      }
    );
    return response.data.data!.trends;
  }

  /**
   * Get generated insights
   */
  async getInsights(): Promise<Insight[]> {
    const response = await this.api.get<ApiResponse<{ insights: Insight[]; count: number }>>(
      '/analytics/insights'
    );
    return response.data.data!.insights;
  }
}
