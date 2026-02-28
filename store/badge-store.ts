import { create } from 'zustand';

interface BadgeNotification {
    id: string;
    name: string;
    type: string;
}

interface BadgeState {
    recentBadge: BadgeNotification | null;
    setRecentBadge: (badge: BadgeNotification | null) => void;
    isBadgeModalVisible: boolean;
    setBadgeModalVisible: (visible: boolean) => void;
}

export const useBadgeStore = create<BadgeState>((set) => ({
    recentBadge: null,
    setRecentBadge: (recentBadge) => set({ recentBadge }),
    isBadgeModalVisible: false,
    setBadgeModalVisible: (isBadgeModalVisible) => set({ isBadgeModalVisible }),
}));
