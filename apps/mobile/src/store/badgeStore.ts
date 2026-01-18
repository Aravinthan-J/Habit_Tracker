import { create } from 'zustand';
import { BadgeDefinition } from '../constants/badges';

interface BadgeStoreState {
  unlockedBadge: BadgeDefinition | null;
  isUnlockModalVisible: boolean;
  showUnlockModal: (badge: BadgeDefinition) => void;
  hideUnlockModal: () => void;
}

export const useBadgeStore = create<BadgeStoreState>((set) => ({
  unlockedBadge: null,
  isUnlockModalVisible: false,
  showUnlockModal: (badge) => set({ unlockedBadge: badge, isUnlockModalVisible: true }),
  hideUnlockModal: () => set({ unlockedBadge: null, isUnlockModalVisible: false }),
}));
