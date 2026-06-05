import { useMemo } from 'react';
import { useHabits } from './useHabits';
import { useCompletions } from './useCompletions';
import { usePreferences } from './usePreferences';
import { today, getLastNDays } from '@/utils/dateHelpers';
import {
    PetTier,
    PET_FACES,
    PET_TIER_LABEL,
    PET_NAME,
    tierForHealth,
    pickPetMessage,
} from '@/constants/petMessages';

/**
 * The Habit Pet's health (0-100) reflects recent habit consistency: 60% from
 * the last 7 days' completion rate and 40% from today's progress (so completing
 * a habit perks the pet up right away). Its message tone is user-selectable.
 */
export function usePet() {
    const { habits } = useHabits();
    const { completions } = useCompletions();
    const { petTone, setPetTone } = usePreferences();

    const { health, hasHabits } = useMemo(() => {
        const total = habits.length;
        if (total === 0) return { health: 50, hasHabits: false };

        const last7 = new Set(getLastNDays(7));
        const got7 = completions.filter((c) => last7.has(c.date)).length;
        const rate7 = got7 / (total * 7);

        const dateStr = today();
        const doneToday = completions.filter((c) => c.date === dateStr).length;
        const todayRatio = doneToday / total;

        const value = Math.max(0, Math.min(100, Math.round((rate7 * 0.6 + todayRatio * 0.4) * 100)));
        return { health: value, hasHabits: true };
    }, [habits, completions]);

    const tier: PetTier = tierForHealth(health);
    const message = useMemo(
        () => (hasHabits ? pickPetMessage(tier, petTone) : 'Create a habit and I’ll come to life! 🐾'),
        [tier, petTone, hasHabits],
    );

    return {
        name: PET_NAME,
        health,
        tier,
        tierLabel: PET_TIER_LABEL[tier],
        face: PET_FACES[tier],
        message,
        tone: petTone,
        setTone: setPetTone,
    };
}
