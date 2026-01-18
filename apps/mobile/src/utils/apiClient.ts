import { createAxiosInstance, AuthApiService, HabitApiService, CompletionApiService } from '@habit-tracker/api-client';
import { SecureStorageService } from '../services/storage/SecureStorageService';
import { useAuthStore } from '../store/authStore';

/**
 * API Base URL - Update this for your environment
 * For Android emulator: use 10.0.2.2 (localhost alias)
 * For iOS simulator: use localhost or your local IP
 * For physical device: use your computer's local IP (192.168.x.x)
 */
const API_BASE_URL = __DEV__
  ? 'http://192.168.29.229:3000/api'  // Your local IP address
  : 'https://your-production-api.com/api';

/**
 * Token storage implementation for mobile
 */
const tokenStorage = {
  getToken: () => SecureStorageService.getToken(),
  setToken: (token: string) => SecureStorageService.saveToken(token),
  removeToken: () => SecureStorageService.removeToken(),
};

/**
 * Handle unauthorized responses (401)
 */
const onUnauthorized = () => {
  // Clear auth state and navigate to login
  useAuthStore.getState().clearAuth();
  SecureStorageService.clearAll();
};

/**
 * Configured axios instance
 */
const axiosInstance = createAxiosInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  tokenStorage,
  onUnauthorized,
});

/**
 * API service instances
 */
export const authApi = new AuthApiService(axiosInstance);
export const habitApi = new HabitApiService(axiosInstance);
export const completionApi = new CompletionApiService(axiosInstance);
