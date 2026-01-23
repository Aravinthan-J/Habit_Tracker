/**
 * API Client Instance
 * Configured instance of ApiService for the mobile app
 */

import { Platform } from "react-native";
import { ApiService } from "@habit-tracker/api-client";
import { SecureStorageService } from "../storage/SecureStorageService";

// API Base URL - automatically configured for different platforms
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return "https://habit-tracker-api.onrender.com/api";
  }

  // Development URLs
  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2 to access localhost
    return "http://10.0.2.2:3000/api";
  }

  // iOS Simulator and physical devices
  // For physical devices, use your computer's IP address
  return "http://10.178.34.135:3000/api";
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
