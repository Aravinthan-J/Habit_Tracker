import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeRepository, Badge } from '../db/badge.repository';
import { HabitRepository } from '../db/habit.repository';
import { CompletionRepository } from '../db/completion.repository';
import { StepRepository } from '../db/step.repository';
import { checkNewBadges } from '../utils/badge-utils';
import { useBadgeStore } from '../store/badge-store';
import { useHaptics } from './useHaptics';

export const useBadges = () => {
    const queryClient = useQueryClient();
    const { setRecentBadge, setBadgeModalVisible } = useBadgeStore();
    const { triggerHaptic } = useHaptics();

    const badgesQuery = useQuery({
        queryKey: ['badges'],
        queryFn: () => BadgeRepository.getAll(),
    });

    const checkBadges = useMutation({
        mutationFn: async () => {
            const allBadges = await BadgeRepository.getAll();
            const earnedIds = allBadges.filter(b => b.earned_at).map(b => b.id);

            const habits = await HabitRepository.getAll();
            // This is a bit heavy, but since it's local SQLite it's fast
            const completions = await CompletionRepository.getCompletionsForDate(''); // Get all
            const stepsHistory = await StepRepository.getHistory('2000-01-01', '2100-01-01');

            const newBadges = checkNewBadges(earnedIds, habits, completions, stepsHistory);

            for (const badge of newBadges) {
                const now = new Date().toISOString();
                await BadgeRepository.markEarned(badge.id, now);

                // Trigger UI celebration
                setRecentBadge({ id: badge.id, name: badge.name, type: badge.type });
                setBadgeModalVisible(true);
                triggerHaptic('success');
            }

            return newBadges;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['badges'] });
        },
    });

    return {
        badges: badgesQuery.data ?? [],
        isLoading: badgesQuery.isLoading,
        checkBadges,
    };
};
