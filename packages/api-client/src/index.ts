/**
 * API Client for Habit Tracker
 */

// Export axios configuration
export * from './config/axios.config';

// Export services
export { ApiService } from './services/ApiService';
export { AuthApiService } from './services/AuthApiService';
export { HabitApiService } from './services/HabitApiService';
export { CompletionApiService } from './services/CompletionApiService';

// Re-export types for convenience
export type {
  User,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  ProfileUpdates,
  ChangePasswordData,
  Habit,
  CreateHabitData,
  UpdateHabitData,
  HabitWithStats,
  HabitStats,
  Completion,
  CompletionWithHabit,
  CreateCompletionData,
  CompletionFilters,
  MonthlyCalendar,
  MonthlyCalendarDay,
  DayCompletion,
  ApiResponse,
  ApiError,
  ValidationError,
} from '@habit-tracker/shared-types';
