/**
 * Badges Hook
 * React Query hooks for badge operations
 * Badges remain server-authoritative but with local caching
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';
import { networkMonitor } from '../services/sync/NetworkMonitor';
import type { Badge } from '@habit-tracker/api-client';

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: async () => {
      // Badges are server-authoritative, only fetch if online
      if (!networkMonitor.isConnected()) {
        return [];
      }
      return await api.badges.getAll();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Fetch user's earned badges
 */
export function useUserBadges() {
  return useQuery({
    queryKey: ['badges', 'user'],
    queryFn: async () => {
      if (!networkMonitor.isConnected()) {
        return [];
      }
      return await api.badges.getUserBadges();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Fetch badge progress
 */
export function useBadgeProgress() {
  return useQuery({
    queryKey: ['badges', 'progress'],
    queryFn: async () => {
      if (!networkMonitor.isConnected()) {
        return [];
      }
      return await api.badges.getProgress();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Check for badge unlocks - only works online
 */
export function useCheckBadges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId?: string) => {
      // Only check badges if online
      if (!networkMonitor.isConnected()) {
        console.log('Offline - badge check skipped, will check on next sync');
        return { newBadges: [] };
      }
      return await api.badges.checkUnlocks(habitId);
    },
    onSuccess: () => {
      // Invalidate badge queries to refetch
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
}

/**
 * Comprehensive badges hook with modal management
 */
export function useBadges() {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [unlockMessage, setUnlockMessage] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch all badges
  const {
    data: allBadges = [],
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useAllBadges();

  // Fetch earned badges
  const {
    data: earnedBadges = [],
    isLoading: isLoadingEarned,
    refetch: refetchEarned,
  } = useUserBadges();

  // Fetch progress
  const {
    data: progress = [],
    isLoading: isLoadingProgress,
    refetch: refetchProgress,
  } = useBadgeProgress();

  // Check badges mutation
  const checkBadgesMutation = useMutation({
    mutationFn: (habitId?: string) => api.badges.checkUnlocks(habitId),
    onSuccess: (data) => {
      if (data.newBadges && data.newBadges.length > 0) {
        // Show unlock modal for first badge
        const firstBadge = data.newBadges[0];
        setUnlockedBadge(firstBadge.badge);
        setUnlockMessage(firstBadge.message);
        setShowUnlockModal(true);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['badges'] });
      }
    },
  });

  const hideUnlockModal = () => {
    setShowUnlockModal(false);
    setUnlockedBadge(null);
    setUnlockMessage('');
  };

  return {
    // Data
    allBadges,
    earnedBadges,
    progress,

    // Loading states
    isLoading: isLoadingAll || isLoadingEarned || isLoadingProgress,

    // Actions
    checkBadges: checkBadgesMutation.mutate,
    refetch: () => {
      refetchAll();
      refetchEarned();
      refetchProgress();
    },

    // Modal state
    showUnlockModal,
    unlockedBadge,
    unlockMessage,
    hideUnlockModal,
  };
}
