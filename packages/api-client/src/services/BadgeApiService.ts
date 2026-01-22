/**
 * Badge API Service
 * Handles badge-related API calls
 */

import { AxiosInstance } from 'axios';
import type { ApiResponse } from '@habit-tracker/shared-types';

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: string;
  tier: string;
  requirement: number;
  iconName: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  habitId?: string;
  earnedAt: string;
}

export interface BadgeProgress {
  badge: Badge;
  current: number;
  required: number;
  percentage: number;
  daysRemaining?: number;
}

export interface UnlockedBadge {
  badge: Badge;
  message: string;
}

export class BadgeApiService {
  constructor(private api: AxiosInstance) {}

  /**
   * Get all badge definitions
   */
  async getAll(): Promise<Badge[]> {
    const response = await this.api.get<ApiResponse<{ badges: Badge[]; count: number }>>(
      '/badges'
    );
    return response.data.data!.badges;
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(): Promise<UserBadge[]> {
    const response = await this.api.get<ApiResponse<{ badges: UserBadge[]; count: number }>>(
      '/badges/user'
    );
    return response.data.data!.badges;
  }

  /**
   * Check for badge unlocks
   */
  async checkUnlocks(habitId?: string): Promise<{ newBadges: UnlockedBadge[] }> {
    const response = await this.api.post<ApiResponse<{ newBadges: UnlockedBadge[]; count: number }>>(
      '/badges/check',
      { habitId }
    );
    return { newBadges: response.data.data!.newBadges };
  }

  /**
   * Get progress toward unearned badges
   */
  async getProgress(): Promise<BadgeProgress[]> {
    const response = await this.api.get<ApiResponse<{ progress: BadgeProgress[]; count: number }>>(
      '/badges/progress'
    );
    return response.data.data!.progress;
  }
}
