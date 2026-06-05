import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useBadges } from './useBadges';
import { getLocalHabits, getAllLocalCompletions } from '@/services/storage/LocalStorageService';
import { computeBadgeNudges, BadgeNudge } from '@/utils/badgeProgress';

/**
 * Progress toward the closest locked badges, computed from the full local
 * completion history. `closest` is the nearest by remaining units; `nearest`
 * is the closest badge that is within notification-nudge range.
 */
export function useBadgeProgress() {
    const { user } = useAuthStore();
    const { badges } = useBadges();

    const earnedKey = useMemo(
        () => badges.filter((b) => b.earned).map((b) => b.id).sort().join(','),
        [badges],
    );

    const { data } = useQuery({
        queryKey: ['badge-progress', user?.uid, earnedKey],
        queryFn: async (): Promise<BadgeNudge[]> => {
            if (!user) return [];
            const earnedIds = new Set(earnedKey ? earnedKey.split(',') : []);
            const habits = await getLocalHabits(user.uid);
            const completions = await getAllLocalCompletions(user.uid);
            return computeBadgeNudges({ habits, completions, earnedIds });
        },
        enabled: !!user,
        staleTime: 1000 * 30,
    });

    const nudges = data ?? [];
    return {
        nudges,
        closest: nudges[0] ?? null,
        nearest: nudges.find((n) => n.near) ?? null,
    };
}
