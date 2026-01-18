import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeDefinition } from '../../constants/badges';
import { UserBadge, BadgeProgress, badgeService } from '@services/badges/BadgeService';

export const useBadges = () => {
  const queryClient = useQueryClient();

  const { data: allBadges = [], isLoading: isLoadingAllBadges } = useQuery<BadgeDefinition[]>({
    queryKey: ['allBadges'],
    queryFn: () => badgeService.getAllBadges(),
  });

  const { data: earnedBadges = [], isLoading: isLoadingEarnedBadges } = useQuery<UserBadge[]>({
    queryKey: ['userBadges'],
    queryFn: () => badgeService.getUserBadges(),
  });

  const { data: badgeProgress = [], isLoading: isLoadingProgress } = useQuery<BadgeProgress[]>({
    queryKey: ['badgeProgress'],
    queryFn: () => badgeService.getBadgeProgress(),
  });

  const checkAndUnlockBadges = async (userId: string, habitId?: string) => {
    try {
      const newBadges = await badgeService.checkAndUnlockBadges(userId, habitId);
      if (newBadges.length > 0) {
        // Invalidate queries to refetch data after unlocking
        queryClient.invalidateQueries({ queryKey: ['userBadges'] });
        queryClient.invalidateQueries({ queryKey: ['badgeProgress'] });
      }
      return newBadges;
    } catch (error) {
      console.error('Error in useBadges hook while unlocking:', error);
      return [];
    }
  };

  const earnedBadgesSet = new Set(earnedBadges.map(b => b.badge.name));
  const badgeProgressMap = new Map(badgeProgress.map(p => [p.badgeId, { current: p.progress, total: p.total }]));

  return {
    allBadges,
    earnedBadges,
    badgeProgress: badgeProgressMap,
    earnedBadgesSet,
    isLoading: isLoadingAllBadges || isLoadingEarnedBadges || isLoadingProgress,
    checkAndUnlockBadges,
  };
};
