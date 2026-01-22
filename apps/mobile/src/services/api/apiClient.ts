/**
 * API Client Instance
 * Configured instance of ApiService for the mobile app
 */

import { ApiService } from '@habit-tracker/api-client';
import { SecureStorageService } from '../storage/SecureStorageService';

// API Base URL - change this to your backend URL
// For development: use your computer's IP address or localhost
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

/**
 * Create API client instance
 */
export const api = new ApiService({
  baseURL: API_BASE_URL,
  timeout: 10000,
  getToken: async () => {
    return await SecureStorageService.getToken();
  },
  onTokenExpired: async () => {
    // Clear auth data when token expires
    await SecureStorageService.clearAll();
    // You could also navigate to login screen here
  },
});
