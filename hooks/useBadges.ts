import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { checkAndAwardBadges } from '@/services/badges/BadgeChecker';
import { BadgeWithStatus } from '@/types/badge.types';

export function useBadges() {
    const { user } = useAuthStore();
    const { showCelebration } = useUIStore();
    const qc = useQueryClient();

    const badgesQuery = useQuery({
        queryKey: ['badges', user?.id],
        queryFn: async (): Promise<BadgeWithStatus[]> => {
            if (!user) return [];

            const { data: allBadges } = await supabase.from('badges').select('*');
            const { data: userBadges } = await supabase
                .from('user_badges')
                .select('*')
                .eq('user_id', user.id);

            const earnedMap = new Map((userBadges ?? []).map((ub) => [ub.badge_id, ub]));

            return (allBadges ?? []).map((badge) => {
                const earned = earnedMap.get(badge.id);
                return {
                    ...badge,
                    earned: !!earned,
                    earned_at: earned?.earned_at ?? null,
                };
            });
        },
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const checkForNewBadges = async (habitId?: string) => {
        if (!user) return;
        const newBadges = await checkAndAwardBadges(user.id, habitId);
        if (newBadges.length > 0) {
            qc.invalidateQueries({ queryKey: ['badges', user.id] });
            // Show celebration for first unlocked badge
            const first = newBadges[0];
            const withStatus: BadgeWithStatus = {
                ...first.badge,
                earned: true,
                earned_at: new Date().toISOString(),
            };
            showCelebration(withStatus);
        }
    };

    const earnedBadges = (badgesQuery.data ?? []).filter((b) => b.earned);
    const unearnedBadges = (badgesQuery.data ?? []).filter((b) => !b.earned);

    return {
        badges: badgesQuery.data ?? [],
        earnedBadges,
        unearnedBadges,
        isLoading: badgesQuery.isLoading,
        checkForNewBadges,
    };
}
