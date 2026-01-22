/**
 * Axios Configuration
 * Centralized API client with interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@habit-tracker/shared-types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  onTokenExpired?: () => void;
  getToken?: () => Promise<string | null>;
}

/**
 * Create configured Axios instance
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, timeout = 10000, onTokenExpired, getToken } = config;

  // Create axios instance
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request Interceptor
   * Attach JWT token to all requests
   */
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (getToken) {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   * Handle common response patterns and errors
   */
  instance.interceptors.response.use(
    (response) => {
      // Return the data directly
      return response;
    },
    (error: AxiosError<ApiResponse>) => {
      // Handle 401 Unauthorized (token expired)
      if (error.response?.status === 401) {
        if (onTokenExpired) {
          onTokenExpired();
        }
      }

      // Extract error message
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred';

      // Create standardized error
      const apiError = {
        message: errorMessage,
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        statusCode: error.response?.status || 500,
        details: error.response?.data?.error?.details,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
}
