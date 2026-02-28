import { create } from 'zustand';
import { BadgeWithStatus } from '@/types/badge.types';

interface UIState {
    celebrationVisible: boolean;
    unlockedBadge: BadgeWithStatus | null;
    showCelebration: (badge: BadgeWithStatus) => void;
    hideCelebration: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    celebrationVisible: false,
    unlockedBadge: null,
    showCelebration: (badge) => set({ celebrationVisible: true, unlockedBadge: badge }),
    hideCelebration: () => set({ celebrationVisible: false, unlockedBadge: null }),
}));
