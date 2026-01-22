/**
 * Habit API Service
 * Handles habit-related API calls
 */

import { AxiosInstance } from 'axios';
import type {
  Habit,
  CreateHabitData,
  UpdateHabitData,
  HabitStats,
  ApiResponse,
} from '@habit-tracker/shared-types';

export class HabitApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Get all user habits
   */
  async getAll(includeArchived: boolean = false): Promise<Habit[]> {
    const response = await this.api.get<ApiResponse<{ habits: Habit[]; count: number }>>(
      '/habits',
      {
        params: { archived: includeArchived },
      }
    );
    return response.data.data!.habits;
  }

  /**
   * Get single habit by ID
   */
  async getById(habitId: string): Promise<Habit> {
    const response = await this.api.get<ApiResponse<{ habit: Habit }>>(
      `/habits/${habitId}`
    );
    return response.data.data!.habit;
  }

  /**
   * Create a new habit
   */
  async create(data: CreateHabitData): Promise<Habit> {
    const response = await this.api.post<ApiResponse<{ habit: Habit }>>(
      '/habits',
      data
    );
    return response.data.data!.habit;
  }

  /**
   * Update habit
   */
  async update(habitId: string, updates: UpdateHabitData): Promise<Habit> {
    const response = await this.api.patch<ApiResponse<{ habit: Habit }>>(
      `/habits/${habitId}`,
      updates
    );
    return response.data.data!.habit;
  }

  /**
   * Delete habit
   */
  async delete(habitId: string): Promise<void> {
    await this.api.delete(`/habits/${habitId}`);
  }

  /**
   * Get habit statistics
   */
  async getStats(habitId: string): Promise<HabitStats> {
    const response = await this.api.get<ApiResponse<{ stats: HabitStats }>>(
      `/habits/${habitId}/stats`
    );
    return response.data.data!.stats;
  }
}
