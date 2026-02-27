/**
 * Badges Hook
 * React Query hooks for badge operations via Supabase
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/supabaseClient';
import { networkMonitor } from '../services/sync/NetworkMonitor';
import { useAuthStore } from '../store/authStore';

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: async () => {
      if (!networkMonitor.isConnected()) return [];
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserBadges() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['badges', 'user'],
    queryFn: async () => {
      if (!networkMonitor.isConnected() || !user?.id) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBadgeProgress() {
  return useQuery({
    queryKey: ['badges', 'progress'],
    queryFn: async () => [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckBadges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_habitId?: string) => {
      // Badge checking will be handled server-side via Edge Functions in future
      return { newBadges: [] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
}

export function useBadges() {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<any | null>(null);
  const [unlockMessage, setUnlockMessage] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: allBadges = [], isLoading: isLoadingAll, refetch: refetchAll } = useAllBadges();
  const { data: earnedBadges = [], isLoading: isLoadingEarned, refetch: refetchEarned } = useUserBadges();
  const { data: progress = [], isLoading: isLoadingProgress, refetch: refetchProgress } = useBadgeProgress();

  const checkBadgesMutation = useMutation({
    mutationFn: async (_habitId?: string) => ({ newBadges: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });

  const hideUnlockModal = () => {
    setShowUnlockModal(false);
    setUnlockedBadge(null);
    setUnlockMessage('');
  };

  return {
    allBadges,
    earnedBadges,
    progress,
    isLoading: isLoadingAll || isLoadingEarned || isLoadingProgress,
    checkBadges: checkBadgesMutation.mutate,
    refetch: () => { refetchAll(); refetchEarned(); refetchProgress(); },
    showUnlockModal,
    unlockedBadge,
    unlockMessage,
    hideUnlockModal,
  };
}
