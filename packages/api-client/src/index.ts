/**
 * API Client Index
 * Re-exports all API client modules
 */

// Main API Service
export { ApiService } from './services/ApiService';

// Individual Services
export { AuthApiService } from './services/AuthApiService';
export { HabitApiService } from './services/HabitApiService';
export { CompletionApiService } from './services/CompletionApiService';

// Config
export { createApiClient } from './config/axios.config';
export type { ApiClientConfig } from './config/axios.config';
