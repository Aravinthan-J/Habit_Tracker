/**
 * Notification API Service
 * Handles notification-related API calls
 */

import { AxiosInstance } from 'axios';
import type { ApiResponse } from '@habit-tracker/shared-types';

export class NotificationApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Register push notification token
   */
  async registerToken(
    token: string,
    platform: 'ios' | 'android',
    deviceId?: string
  ): Promise<void> {
    await this.api.post<ApiResponse<{}>>(
      '/notifications/register',
      { token, platform, deviceId }
    );
  }

  /**
   * Unregister push notification token
   */
  async unregisterToken(token: string): Promise<void> {
    await this.api.post<ApiResponse<{}>>(
      '/notifications/unregister',
      { token }
    );
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<void> {
    await this.api.post<ApiResponse<{}>>(
      '/notifications/test'
    );
  }
}
