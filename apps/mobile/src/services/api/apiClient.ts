/**
 * API Client Instance
 * Configured instance of ApiService for the mobile app
 */

import { Platform } from "react-native";
import { ApiService } from "@habit-tracker/api-client";
import { SecureStorageService } from "../storage/SecureStorageService";

// API Base URL - automatically configured for different platforms
const getApiBaseUrl = () => {
  // Production API (always works)
  const PRODUCTION_API = "https://habit-tracker-api-4p6m.onrender.com/api";

  // Set to true to use deployed API even in dev mode (for physical devices)
  const USE_DEPLOYED_API = true;

  if (!__DEV__ || USE_DEPLOYED_API) {
    return PRODUCTION_API;
  }

  // Development URLs (for emulators/simulators with local backend)
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
};

const API_BASE_URL = getApiBaseUrl();

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
