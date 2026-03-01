import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

    return BADGE_DEFINITIONS.map((def) => {
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
            if (['completion_100', 'completion_500', 'completion_1000', 'completion_5000'].includes(def.id)) {
                currentValue = allCompletions.length;
                earned = currentValue >= def.requirement;
            } else if (def.id === 'completion_perfect_week') {
                const last7 = getLast30Days().slice(-7);
                earned = habits.length > 0 && last7.every((date) =>
                    habits.every((h) => allCompletions.some((c) => c.habit_id === h.id && c.date === date))
                );
                currentValue = earned ? 7 : 0;
            }
        } else if (def.type === 'special') {
            if (def.id === 'special_collector' || def.id === 'special_power_user') {
                currentValue = habits.length;
                earned = currentValue >= def.requirement;
            } else if (def.id === 'special_consistency') {
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
            id: def.id,
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
        queryKey: ['badges', user?.uid],
        queryFn: async (): Promise<BadgeWithStatus[]> => {
            if (!user) return [];

            try {
                const snapshot = await getDocs(collection(db, 'users', user.uid, 'user_badges'));
                // badge_id in Firestore is the badge name (from BADGE_DEFINITIONS)
                const earnedMap = new Map(
                    snapshot.docs.map((d) => {
                        const data = d.data();
                        return [data.badge_id as string, data.earned_at as string];
                    })
                );

                return BADGE_DEFINITIONS.map((def) => {
                    const earnedAt = earnedMap.get(def.id) ?? null;
                    return {
                        id: def.id,
                        name: def.name,
                        description: def.description,
                        type: def.type,
                        tier: def.tier,
                        requirement: def.requirement,
                        icon_name: def.icon_name,
                        created_at: new Date().toISOString(),
                        earned: !!earnedAt,
                        earned_at: earnedAt,
                    } as BadgeWithStatus;
                });
            } catch {
                return computeBadgesLocally(user.uid);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const checkForNewBadges = async (habitId?: string) => {
        if (!user) return;

        try {
            const newBadges = await checkAndAwardBadges(user.uid, habitId);
            if (newBadges.length > 0) {
                qc.invalidateQueries({ queryKey: ['badges', user.uid] });
                showCelebration({ ...newBadges[0].badge, earned: true, earned_at: new Date().toISOString() });
            }
        } catch {
            const prev = qc.getQueryData<BadgeWithStatus[]>(['badges', user.uid]) ?? [];
            const next = await computeBadgesLocally(user.uid);
            qc.setQueryData(['badges', user.uid], next);

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
