import { useState, useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { useBadgeStore } from '../store/badgeStore';
import { notificationService } from '../services/notifications/ExpoNotificationService';
import {
  checkMilestoneReached,
  STREAK_MILESTONES,
  COMPLETION_MILESTONES,
  Milestone,
} from '../constants/milestones';

export type CelebrationType =
  | 'badge_unlock'
  | 'streak_milestone'
  | 'completion_milestone'
  | 'step_goal'
  | 'all_complete'
  | 'first_completion';

export interface CelebrationData {
  type: CelebrationType;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  duration: number;
  badge?: any;
  milestone?: Milestone;
}

/**
 * Hook for managing celebration animations and haptics
 */
export function useCelebration() {
  const [isShowing, setIsShowing] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const haptics = useHaptics();
  const { showUnlockModal } = useBadgeStore();

  const showCelebration = useCallback((data: CelebrationData) => {
    setCelebrationData(data);
    setIsShowing(true);

    // Trigger haptic based on type
    switch (data.type) {
      case 'badge_unlock':
        haptics.success();
        break;
      case 'streak_milestone':
      case 'completion_milestone':
        haptics.medium();
        break;
      case 'step_goal':
      case 'all_complete':
        haptics.success();
        break;
      case 'first_completion':
        haptics.light();
        break;
    }

    // Auto-hide after duration
    setTimeout(() => {
      setIsShowing(false);
      setCelebrationData(null);
    }, data.duration);
  }, [haptics]);

  const hideCelebration = useCallback(() => {
    setIsShowing(false);
    setCelebrationData(null);
  }, []);

  const celebrateBadgeUnlock = useCallback((badge: any) => {
    showCelebration({
      type: 'badge_unlock',
      title: `Badge Unlocked!`,
      description: badge.badge.name,
      icon: badge.badge.iconName,
      color: badge.badge.tier === 'gold' ? '#FFD700' :
             badge.badge.tier === 'silver' ? '#C0C0C0' :
             badge.badge.tier === 'platinum' ? '#E5E4E2' : '#CD7F32',
      duration: 3000,
      badge,
    });

    // Send notification
    notificationService.sendBadgeUnlock(badge.badge.name, badge.badgeId);
  }, [showCelebration]);

  const celebrateStreakMilestone = useCallback((
    previousStreak: number,
    currentStreak: number,
    habitName: string
  ) => {
    const milestone = checkMilestoneReached(
      previousStreak,
      currentStreak,
      STREAK_MILESTONES
    );

    if (milestone) {
      showCelebration({
        type: 'streak_milestone',
        title: milestone.name,
        description: `${milestone.days}-day streak on ${habitName}!`,
        icon: milestone.icon,
        color: milestone.color,
        duration: milestone.celebrationDuration,
        milestone,
      });
    }
  }, [showCelebration]);

  const celebrateCompletionMilestone = useCallback((
    previousCount: number,
    currentCount: number
  ) => {
    const milestone = checkMilestoneReached(
      previousCount,
      currentCount,
      COMPLETION_MILESTONES
    );

    if (milestone) {
      showCelebration({
        type: 'completion_milestone',
        title: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        color: milestone.color,
        duration: milestone.celebrationDuration,
        milestone,
      });
    }
  }, [showCelebration]);

  const celebrateStepGoal = useCallback((steps: number) => {
    showCelebration({
      type: 'step_goal',
      title: 'Step Goal Reached!',
      description: `You walked ${steps.toLocaleString()} steps today!`,
      icon: 'footsteps',
      color: '#4CAF50',
      duration: 2500,
    });

    notificationService.sendStepGoalAchieved(steps);
  }, [showCelebration]);

  const celebrateAllComplete = useCallback(() => {
    showCelebration({
      type: 'all_complete',
      title: 'Perfect Day!',
      description: 'You completed all your habits today!',
      icon: 'checkmark-done-circle',
      color: '#6C63FF',
      duration: 3000,
    });
  }, [showCelebration]);

  const celebrateFirstCompletion = useCallback(() => {
    showCelebration({
      type: 'first_completion',
      title: 'Great Start!',
      description: 'First habit of the day completed!',
      icon: 'checkmark-circle',
      color: '#4ECDC4',
      duration: 1500,
    });
  }, [showCelebration]);

  // Process a newly unlocked badge and show modal
  const processNewBadge = useCallback((badge: any) => {
    celebrateBadgeUnlock(badge);
    showUnlockModal(badge.badge);
  }, [celebrateBadgeUnlock, showUnlockModal]);

  return {
    isShowing,
    celebrationData,
    showCelebration,
    hideCelebration,
    celebrateBadgeUnlock,
    celebrateStreakMilestone,
    celebrateCompletionMilestone,
    celebrateStepGoal,
    celebrateAllComplete,
    celebrateFirstCompletion,
    processNewBadge,
  };
}
