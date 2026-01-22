/**
 * Badges Hook
 * React Query hooks for badge operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/apiClient';

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: async () => {
      return await api.badges.getAll();
    },
  });
}

/**
 * Fetch user's earned badges
 */
export function useUserBadges() {
  return useQuery({
    queryKey: ['badges', 'user'],
    queryFn: async () => {
      return await api.badges.getUserBadges();
    },
  });
}

/**
 * Fetch badge progress
 */
export function useBadgeProgress() {
  return useQuery({
    queryKey: ['badges', 'progress'],
    queryFn: async () => {
      return await api.badges.getProgress();
    },
  });
}

/**
 * Check for badge unlocks
 */
export function useCheckBadges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId?: string) => {
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
