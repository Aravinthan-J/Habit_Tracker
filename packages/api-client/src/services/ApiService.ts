import { AxiosInstance } from 'axios';
import { ApiResponse } from '@habit-tracker/shared-types';

/**
 * Base API service class with common methods
 */
export class ApiService {
  constructor(protected axios: AxiosInstance) {}

  /**
   * Extract data from API response
   */
  protected unwrapResponse<T>(response: { data: ApiResponse<T> }): T {
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'API request failed');
    }
    return response.data.data as T;
  }

  /**
   * GET request
   */
  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.axios.get<ApiResponse<T>>(url, { params });
    return this.unwrapResponse(response);
  }

  /**
   * POST request
   */
  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.axios.post<ApiResponse<T>>(url, data);
    return this.unwrapResponse(response);
  }

  /**
   * PATCH request
   */
  protected async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.axios.patch<ApiResponse<T>>(url, data);
    return this.unwrapResponse(response);
  }

  /**
   * DELETE request
   */
  protected async delete<T>(url: string): Promise<T> {
    const response = await this.axios.delete<ApiResponse<T>>(url);
    return this.unwrapResponse(response);
  }
}
