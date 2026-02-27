import { create } from 'zustand';
import { BadgeWithStatus } from '@/types/badge.types';

import { PREMIUM_THEMES, PremiumTheme } from '@/constants/Themes';

type Theme = 'dark' | 'light' | 'system' | keyof typeof PREMIUM_THEMES;

interface UIState {
    theme: Theme;
    premiumTheme: PremiumTheme | null;
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
    premiumTheme: null,
    celebrationVisible: false,
    unlockedBadge: null,
    analyticsViewCount: 0,
    setTheme: (theme) => {
        const premiumTheme = theme in PREMIUM_THEMES ? PREMIUM_THEMES[theme as keyof typeof PREMIUM_THEMES] : null;
        set({ theme, premiumTheme });
    },
    showCelebration: (badge) => set({ celebrationVisible: true, unlockedBadge: badge }),
    hideCelebration: () => set({ celebrationVisible: false, unlockedBadge: null }),
    incrementAnalyticsView: () =>
        set((state) => ({ analyticsViewCount: state.analyticsViewCount + 1 })),
}));
