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
export { BadgeApiService } from './services/BadgeApiService';
export type { Badge, UserBadge, BadgeProgress, UnlockedBadge } from './services/BadgeApiService';

// Config
export { createApiClient } from './config/axios.config';
export type { ApiClientConfig } from './config/axios.config';
