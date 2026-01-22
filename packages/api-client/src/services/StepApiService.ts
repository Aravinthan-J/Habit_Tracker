/**
 * Step API Service
 * Handles step tracking API calls
 */

import { AxiosInstance } from 'axios';
import type { ApiResponse } from '@habit-tracker/shared-types';

export interface StepData {
  id: string;
  userId: string;
  date: string;
  steps: number;
  distance: number;
  calories?: number;
  activeMinutes?: number;
  source: string;
}

export interface StepStats {
  totalSteps: number;
  totalDistance: number;
  averageStepsPerDay: number;
  bestDay: {
    date: string;
    steps: number;
  } | null;
  currentStreak: number;
  longestStreak: number;
  daysWithGoal: number;
}

export interface LogStepsData {
  date: string;
  steps: number;
  distance: number;
  calories?: number;
  activeMinutes?: number;
  source?: 'pedometer' | 'manual';
}

export class StepApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Log step data
   */
  async logSteps(data: LogStepsData): Promise<StepData> {
    const response = await this.api.post<ApiResponse<{ stepData: StepData }>>(
      '/steps',
      data
    );
    return response.data.data!.stepData;
  }

  /**
   * Get step data for date range
   */
  async getSteps(startDate: string, endDate: string): Promise<StepData[]> {
    const response = await this.api.get<ApiResponse<{ stepData: StepData[]; count: number }>>(
      '/steps',
      {
        params: { startDate, endDate },
      }
    );
    return response.data.data!.stepData;
  }

  /**
   * Get today's steps
   */
  async getTodaySteps(): Promise<StepData & { goalReached: boolean; stepGoal: number }> {
    const response = await this.api.get<
      ApiResponse<{ stepData: StepData & { goalReached: boolean; stepGoal: number } }>
    >('/steps/today');
    return response.data.data!.stepData;
  }

  /**
   * Get step statistics
   */
  async getStats(): Promise<StepStats> {
    const response = await this.api.get<ApiResponse<StepStats>>('/steps/stats');
    return response.data.data!;
  }

  /**
   * Get step goal
   */
  async getStepGoal(): Promise<number> {
    const response = await this.api.get<ApiResponse<{ stepGoal: number }>>('/steps/goal');
    return response.data.data!.stepGoal;
  }

  /**
   * Update step goal
   */
  async updateStepGoal(stepGoal: number): Promise<void> {
    await this.api.put<ApiResponse<{ stepGoal: number }>>('/steps/goal', { stepGoal });
  }
}
