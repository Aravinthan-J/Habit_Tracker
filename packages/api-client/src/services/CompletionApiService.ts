import { AxiosInstance } from 'axios';
import {
  CompletionWithHabit,
  CreateCompletionData,
  CompletionFilters,
  MonthlyCalendar,
} from '@habit-tracker/shared-types';
import { ApiService } from './ApiService';

/**
 * Completion API service
 */
export class CompletionApiService extends ApiService {
  constructor(axios: AxiosInstance) {
    super(axios);
  }

  /**
   * Mark a habit as complete
   *
   * @param data - Completion data
   * @returns Created completion
   */
  async create(data: CreateCompletionData): Promise<CompletionWithHabit> {
    const response = await this.post<{ completion: CompletionWithHabit }>(
      '/completions',
      data
    );
    return response.completion;
  }

  /**
   * Unmark a habit completion
   *
   * @param habitId - Habit ID
   * @param date - Date string (YYYY-MM-DD)
   */
  async delete(habitId: string, date: string): Promise<void> {
    await this.delete<void>(`/completions/${habitId}/${date}`);
  }

  /**
   * Get completions with filters
   *
   * @param filters - Optional filters
   * @returns Array of completions
   */
  async getAll(filters?: CompletionFilters): Promise<CompletionWithHabit[]> {
    const response = await this.get<{
      completions: CompletionWithHabit[];
      count: number;
    }>('/completions', filters);
    return response.completions;
  }

  /**
   * Get monthly calendar view
   *
   * @param year - Year (YYYY)
   * @param month - Month (1-12)
   * @returns Monthly calendar data
   */
  async getMonthlyCalendar(year: number, month: number): Promise<MonthlyCalendar> {
    const response = await this.get<MonthlyCalendar>(
      `/completions/calendar/${year}/${month}`
    );
    return response;
  }
}
