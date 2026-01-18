import { AxiosInstance } from 'axios';
import {
  Habit,
  CreateHabitData,
  UpdateHabitData,
  HabitWithStats,
} from '@habit-tracker/shared-types';
import { ApiService } from './ApiService';

/**
 * Habit API service
 */
export class HabitApiService extends ApiService {
  constructor(axios: AxiosInstance) {
    super(axios);
  }

  /**
   * Get all habits
   *
   * @param archived - Include archived habits
   * @returns Array of habits
   */
  async getAll(archived: boolean = false): Promise<Habit[]> {
    const response = await this.get<{ habits: Habit[]; count: number }>(
      '/habits',
      { archived }
    );
    return response.habits;
  }

  /**
   * Get habit by ID
   *
   * @param habitId - Habit ID
   * @returns Habit data
   */
  async getById(habitId: string): Promise<Habit> {
    const response = await this.get<{ habit: Habit }>(`/habits/${habitId}`);
    return response.habit;
  }

  /**
   * Create a new habit
   *
   * @param data - Habit creation data
   * @returns Created habit
   */
  async create(data: CreateHabitData): Promise<Habit> {
    const response = await this.post<{ habit: Habit }>('/habits', data);
    return response.habit;
  }

  /**
   * Update a habit
   *
   * @param habitId - Habit ID
   * @param data - Update data
   * @returns Updated habit
   */
  async update(habitId: string, data: UpdateHabitData): Promise<Habit> {
    const response = await this.patch<{ habit: Habit }>(
      `/habits/${habitId}`,
      data
    );
    return response.habit;
  }

  /**
   * Delete (archive) a habit
   *
   * @param habitId - Habit ID
   */
  async delete(habitId: string): Promise<void> {
    await this.delete<void>(`/habits/${habitId}`);
  }

  /**
   * Get habit statistics
   *
   * @param habitId - Habit ID
   * @returns Habit with stats
   */
  async getStats(habitId: string): Promise<HabitWithStats> {
    const response = await this.get<{ habit: HabitWithStats }>(
      `/habits/${habitId}/stats`
    );
    return response.habit;
  }
}
