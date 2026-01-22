/**
 * Main API Service
 * Combines all API service modules
 */

import { AxiosInstance } from 'axios';
import { createApiClient, ApiClientConfig } from '../config/axios.config';
import { AuthApiService } from './AuthApiService';
import { HabitApiService } from './HabitApiService';
import { CompletionApiService } from './CompletionApiService';
import { BadgeApiService } from './BadgeApiService';
import { AnalyticsApiService } from './AnalyticsApiService';
import { NotificationApiService } from './NotificationApiService';
import { StepApiService } from './StepApiService';

export class ApiService {
  private api: AxiosInstance;

  public auth: AuthApiService;
  public habits: HabitApiService;
  public completions: CompletionApiService;
  public badges: BadgeApiService;
  public analytics: AnalyticsApiService;
  public notifications: NotificationApiService;
  public steps: StepApiService;

  constructor(config: ApiClientConfig) {
    // Create axios instance
    this.api = createApiClient(config);

    // Initialize service modules
    this.auth = new AuthApiService(this.api);
    this.habits = new HabitApiService(this.api);
    this.completions = new CompletionApiService(this.api);
    this.badges = new BadgeApiService(this.api);
    this.analytics = new AnalyticsApiService(this.api);
    this.notifications = new NotificationApiService(this.api);
    this.steps = new StepApiService(this.api);
  }

  /**
   * Get raw axios instance for custom requests
   */
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.api.defaults.baseURL = baseURL;
  }

  /**
   * Set authorization token
   */
  setToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}
