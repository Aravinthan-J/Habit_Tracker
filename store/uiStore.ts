import { create } from 'zustand';
import { BadgeWithStatus } from '@/types/badge.types';

type Theme = 'dark' | 'light' | 'system';

interface UIState {
    theme: Theme;
    celebrationVisible: boolean;
    unlockedBadge: BadgeWithStatus | null;
    analyticsViewCount: number;
    setTheme: (theme: Theme) => void;
    showCelebration: (badge: BadgeWithStatus) => void;
    hideCelebration: () => void;
    incrementAnalyticsView: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'dark',
    celebrationVisible: false,
    unlockedBadge: null,
    analyticsViewCount: 0,
    setTheme: (theme) => set({ theme }),
    showCelebration: (badge) => set({ celebrationVisible: true, unlockedBadge: badge }),
    hideCelebration: () => set({ celebrationVisible: false, unlockedBadge: null }),
    incrementAnalyticsView: () =>
        set((state) => ({ analyticsViewCount: state.analyticsViewCount + 1 })),
}));
