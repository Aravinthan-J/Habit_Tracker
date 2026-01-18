import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@habit-tracker/shared-types';

/**
 * Token storage interface for mobile/web
 */
export interface TokenStorage {
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
  removeToken: () => Promise<void>;
}

/**
 * Axios configuration options
 */
export interface AxiosConfigOptions {
  baseURL: string;
  timeout?: number;
  tokenStorage?: TokenStorage;
  onUnauthorized?: () => void;
}

/**
 * Create configured axios instance
 *
 * @param options - Configuration options
 * @returns Configured axios instance
 */
export const createAxiosInstance = (
  options: AxiosConfigOptions
): AxiosInstance => {
  const { baseURL, timeout = 10000, tokenStorage, onUnauthorized } = options;

  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - attach auth token
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (tokenStorage) {
        const token = await tokenStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Clear token
        if (tokenStorage) {
          await tokenStorage.removeToken();
        }

        // Call unauthorized callback
        if (onUnauthorized) {
          onUnauthorized();
        }
      }

      // Format error for consistent handling
      const apiError = {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          'NETWORK_ERROR',
        message:
          error.response?.data?.error?.message ||
          error.message ||
          'An unexpected error occurred',
        details: error.response?.data?.error?.details,
        status: error.response?.status,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};
