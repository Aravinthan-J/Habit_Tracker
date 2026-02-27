/**
 * API Client Instance
 * Configured instance of ApiService for the mobile app
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import { ApiService } from "@habit-tracker/api-client";
import { SecureStorageService } from "../storage/SecureStorageService";

// API Base URL - automatically configured for different platforms
const getApiBaseUrl = () => {
  // Production API (always works)
  const PRODUCTION_API = "https://habit-tracker-api-4p6m.onrender.com/api";

  if (!__DEV__) {
    return PRODUCTION_API;
  }

  // Get dev machine IP from Expo's runtime manifest
  // manifest2 = new Expo Go format, manifest = legacy format
  const debuggerHost =
    (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost ||
    (Constants.manifest as any)?.debuggerHost;
  const localIP = debuggerHost ? debuggerHost.split(":")[0] : null;

  if (localIP) {
    return `http://${localIP}:3000/api`;
  }

  // Fallbacks when not running through Expo Go
  if (Platform.OS === "android") {
    // return "user ip/api";
    return PRODUCTION_API;
  }

  return "http://localhost:3000/api";
};

const API_BASE_URL = getApiBaseUrl();
export const DEBUG_API_URL = API_BASE_URL;

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
