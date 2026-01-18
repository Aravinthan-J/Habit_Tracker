import { apiClient } from '../../utils/apiClient';
import { BADGE_DEFINITIONS, BadgeDefinition, BadgeTier } from '../../constants/badges';
import { notificationService } from '../notifications/ExpoNotificationService';

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: BadgeDefinition; // Fully populated badge definition
  habitId?: string; // Optional, for habit-specific badges
  earnedAt: string; // ISO date string
}

export interface BadgeProgress {
  badgeId: string;
  progress: number; // Current value towards requirement
  total: number;    // Requirement for the badge
  isEarned: boolean;
  earnedAt?: string;
}

class BadgeService {
  private localBadgeDefinitions: BadgeDefinition[] = BADGE_DEFINITIONS;

  public getAllBadges(): BadgeDefinition[] {
    return this.localBadgeDefinitions;
  }

  public getBadgeById(badgeId: string): BadgeDefinition | undefined {
    return this.localBadgeDefinitions.find(badge => badge.name === badgeId); // Assuming badgeId is the name for now
  }

  public async getUserBadges(): Promise<UserBadge[]> {
    try {
      const response = await apiClient.get<UserBadge[]>('/badges/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  public async getBadgeProgress(): Promise<BadgeProgress[]> {
    try {
      const response = await apiClient.get<BadgeProgress[]>('/badges/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching badge progress:', error);
      return [];
    }
  }

  public async checkAndUnlockBadges(userId: string, habitId?: string): Promise<UserBadge[]> {
    try {
      const response = await apiClient.post<UserBadge[]>('/badges/check', { userId, habitId });
      const newlyUnlockedBadges = response.data;

      for (const badge of newlyUnlockedBadges) {
        notificationService.sendBadgeUnlock(badge.badge.name, badge.badge.id);
      }

      return newlyUnlockedBadges;
    } catch (error) {
      console.error('Error checking and unlocking badges:', error);
      return [];
    }
  }

  // This method would be called by the backend, but included here for completeness
  public async unlockBadge(userId: string, badgeId: string, habitId?: string): Promise<UserBadge | null> {
    try {
      const response = await apiClient.post<UserBadge>('/badges/unlock', { userId, badgeId, habitId });
      notificationService.sendBadgeUnlock(response.data.badge.name, response.data.badge.id);
      return response.data;
    } catch (error) {
      console.error(`Error unlocking badge ${badgeId}:`, error);
      return null;
    }
  }

  // Utility to determine badge rarity based on tier
  public getBadgeRarity(tier: BadgeTier): string {
    switch (tier) {
      case 'bronze': return 'Common';
      case 'silver': return 'Uncommon';
      case 'gold': return 'Rare';
      case 'platinum': return 'Legendary';
      default: return 'Unknown';
    }
  }
}

export const badgeService = new BadgeService();