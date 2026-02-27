import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { checkAndAwardBadges } from '@/services/badges/BadgeChecker';
import { BadgeWithStatus } from '@/types/badge.types';
import { BADGE_DEFINITIONS } from '@/constants/badges';
import { getLocalHabits, getAllLocalCompletions } from '@/services/storage/LocalStorageService';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { getLast30Days } from '@/utils/dateHelpers';

async function computeBadgesLocally(userId: string): Promise<BadgeWithStatus[]> {
    const habits = await getLocalHabits(userId);
    const allCompletions = await getAllLocalCompletions(userId);

    return BADGE_DEFINITIONS.map((def, i) => {
        let earned = false;
        let currentValue = 0;

        if (def.type === 'streak') {
            for (const habit of habits) {
                const dates = allCompletions.filter((c) => c.habit_id === habit.id).map((c) => c.date);
                const streak = calculateCurrentStreak(dates);
                if (streak > currentValue) currentValue = streak;
                if (streak >= def.requirement) earned = true;
            }
        } else if (def.type === 'completion') {
            if (def.name.includes('Completions Club')) {
                currentValue = allCompletions.length;
                earned = currentValue >= def.requirement;
            } else if (def.name === 'Perfect Week') {
                const last7 = getLast30Days().slice(-7);
                earned = habits.length > 0 && last7.every((date) =>
                    habits.every((h) => allCompletions.some((c) => c.habit_id === h.id && c.date === date))
                );
                currentValue = earned ? 7 : 0;
            }
        } else if (def.type === 'special') {
            if (def.name === 'Habit Collector' || def.name === 'Power User') {
                currentValue = habits.length;
                earned = currentValue >= def.requirement;
            } else if (def.name === 'Consistency King') {
                let activeStreaks = 0;
                for (const h of habits) {
                    const dates = allCompletions.filter((c) => c.habit_id === h.id).map((c) => c.date);
                    if (calculateCurrentStreak(dates) >= 3) activeStreaks++;
                }
                currentValue = activeStreaks;
                earned = activeStreaks >= def.requirement;
            }
        }

        return {
            id: `local-badge-${i}`,
            name: def.name,
            description: def.description,
            type: def.type,
            tier: def.tier,
            requirement: def.requirement,
            icon_name: def.icon_name,
            created_at: new Date().toISOString(),
            earned,
            earned_at: earned ? new Date().toISOString() : null,
            progress: def.requirement > 0 ? Math.min(Math.round((currentValue / def.requirement) * 100), 100) : earned ? 100 : 0,
            currentValue,
        } as BadgeWithStatus;
    });
}

export function useBadges() {
    const { user } = useAuthStore();
    const { showCelebration } = useUIStore();
    const qc = useQueryClient();

    const badgesQuery = useQuery({
        queryKey: ['badges', user?.id],
        queryFn: async (): Promise<BadgeWithStatus[]> => {
            if (!user) return [];

            try {
                const { data: allBadges, error: badgesErr } = await supabase.from('badges').select('*');
                if (badgesErr) throw badgesErr;

                const { data: userBadges } = await supabase
                    .from('user_badges')
                    .select('*')
                    .eq('user_id', user.id);

                const earnedMap = new Map((userBadges ?? []).map((ub) => [ub.badge_id, ub]));

                return (allBadges ?? []).map((badge) => {
                    const earned = earnedMap.get(badge.id);
                    return { ...badge, earned: !!earned, earned_at: earned?.earned_at ?? null };
                });
            } catch {
                // Offline fallback: compute locally from SQLite
                return computeBadgesLocally(user.id);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const checkForNewBadges = async (habitId?: string) => {
        if (!user) return;

        try {
            const newBadges = await checkAndAwardBadges(user.id, habitId);
            if (newBadges.length > 0) {
                qc.invalidateQueries({ queryKey: ['badges', user.id] });
                showCelebration({ ...newBadges[0].badge, earned: true, earned_at: new Date().toISOString() });
            }
        } catch {
            // Offline: recompute locally and detect newly earned
            const prev = qc.getQueryData<BadgeWithStatus[]>(['badges', user.id]) ?? [];
            const next = await computeBadgesLocally(user.id);
            qc.setQueryData(['badges', user.id], next);

            const prevEarnedIds = new Set(prev.filter((b) => b.earned).map((b) => b.id));
            const newlyEarned = next.filter((b) => b.earned && !prevEarnedIds.has(b.id));
            if (newlyEarned.length > 0) showCelebration(newlyEarned[0]);
        }
    };

    return {
        badges: badgesQuery.data ?? [],
        earnedBadges: (badgesQuery.data ?? []).filter((b) => b.earned),
        unearnedBadges: (badgesQuery.data ?? []).filter((b) => !b.earned),
        isLoading: badgesQuery.isLoading,
        checkForNewBadges,
    };
}
