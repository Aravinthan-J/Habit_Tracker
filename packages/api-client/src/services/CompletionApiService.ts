/**
 * Completion API Service
 * Handles completion-related API calls
 */

import { AxiosInstance } from 'axios';
import type {
  Completion,
  CreateCompletionData,
  CompletionFilters,
  MonthlyCalendar,
  CompletionWithHabit,
  ApiResponse,
} from '@habit-tracker/shared-types';

export class CompletionApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Mark habit as complete
   */
  async create(data: CreateCompletionData): Promise<Completion> {
    const response = await this.api.post<ApiResponse<{ completion: Completion }>>(
      '/completions',
      data
    );
    return response.data.data!.completion;
  }

  /**
   * Unmark habit completion
   */
  async delete(habitId: string, date: string): Promise<void> {
    await this.api.delete(`/completions/${habitId}/${date}`);
  }

  /**
   * Get completions with optional filters
   */
  async getAll(filters?: CompletionFilters): Promise<CompletionWithHabit[]> {
    const response = await this.api.get<
      ApiResponse<{ completions: CompletionWithHabit[]; count: number }>
    >('/completions', {
      params: filters,
    });
    return response.data.data!.completions;
  }

  /**
   * Get monthly calendar data
   */
  async getMonthlyCalendar(year: number, month: number): Promise<MonthlyCalendar> {
    const response = await this.api.get<ApiResponse<MonthlyCalendar>>(
      `/completions/calendar/${year}/${month}`
    );
    return response.data.data!;
  }
}
