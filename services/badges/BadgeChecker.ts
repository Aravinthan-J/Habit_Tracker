import { supabase } from '@/lib/supabase';
import { Badge, UserBadge } from '@/types/badge.types';
import { calculateCurrentStreak, calculateLongestStreak } from '@/utils/streakCalculator';
import { today, getLast30Days } from '@/utils/dateHelpers';

export interface BadgeCheckResult {
    badge: Badge;
    habitId?: string;
}

export async function checkAndAwardBadges(
    userId: string,
    habitId?: string
): Promise<BadgeCheckResult[]> {
    const newlyEarned: BadgeCheckResult[] = [];

    try {
        // Fetch all badge definitions
        const { data: allBadges } = await supabase.from('badges').select('*');
        if (!allBadges) return [];

        // Fetch already earned badges
        const { data: earned } = await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', userId);
        const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));

        // Fetch all completions for user
        const { data: allCompletions } = await supabase
            .from('completions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        const completions = allCompletions ?? [];

        // Fetch all habits for user
        const { data: habits } = await supabase
            .from('habits')
            .select('id, created_at')
            .eq('user_id', userId);
        const totalHabits = habits?.length ?? 0;

        // Fetch step data
        const { data: stepRows } = await supabase
            .from('step_data')
            .select('steps, date, distance')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        const stepData = stepRows ?? [];

        // Fetch user profile for step goal
        const { data: profile } = await supabase
            .from('profiles')
            .select('step_goal, created_at')
            .eq('id', userId)
            .single();
        const stepGoal = profile?.step_goal ?? 10000;

        for (const badge of allBadges) {
            if (earnedIds.has(badge.id)) continue;

            let qualified = false;
            let qualifyingHabitId: string | undefined = habitId;

            if (badge.type === 'streak') {
                // Check streak for a specific habit or all habits
                const habitsToCheck = habitId ? [{ id: habitId }] : (habits ?? []);
                for (const h of habitsToCheck) {
                    const dates = completions
                        .filter((c) => c.habit_id === h.id)
                        .map((c) => c.date);
                    const streak = calculateCurrentStreak(dates);
                    if (streak >= badge.requirement) {
                        qualified = true;
                        qualifyingHabitId = h.id;
                        break;
                    }
                }
            } else if (badge.type === 'completion') {
                if (badge.name.includes('Completions Club')) {
                    qualified = completions.length >= badge.requirement;
                } else if (badge.name === 'Perfect Week') {
                    qualified = checkPerfectWeek(completions, habits ?? [], 7);
                }
                // Other completion badges could be extended here
            } else if (badge.type === 'step') {
                if (badge.name === '10K Walker') {
                    qualified = stepData.some((s) => s.steps >= 10000);
                } else if (badge.name === 'Step Streak - Week') {
                    qualified = checkStepStreak(stepData, stepGoal, 7);
                } else if (badge.name === 'Step Streak - 2 Weeks') {
                    qualified = checkStepStreak(stepData, stepGoal, 14);
                } else if (badge.name === 'Step Streak - Month') {
                    qualified = checkStepStreak(stepData, stepGoal, 30);
                } else if (badge.name === '100km Milestone') {
                    const totalKm = stepData.reduce((sum, s) => sum + (s.distance ?? 0), 0);
                    qualified = totalKm >= 100;
                } else if (badge.name === '500km Milestone') {
                    const totalKm = stepData.reduce((sum, s) => sum + (s.distance ?? 0), 0);
                    qualified = totalKm >= 500;
                }
            } else if (badge.type === 'special') {
                if (badge.name === 'Habit Collector') {
                    qualified = totalHabits >= badge.requirement;
                } else if (badge.name === 'Power User') {
                    qualified = totalHabits >= badge.requirement;
                } else if (badge.name === 'Consistency King') {
                    // 3 habits with active streaks >= 3 days
                    let activeStreaks = 0;
                    for (const h of habits ?? []) {
                        const dates = completions.filter((c) => c.habit_id === h.id).map((c) => c.date);
                        if (calculateCurrentStreak(dates) >= 3) activeStreaks++;
                    }
                    qualified = activeStreaks >= badge.requirement;
                }
            }

            if (qualified) {
                const { error } = await supabase.from('user_badges').insert({
                    user_id: userId,
                    badge_id: badge.id,
                    habit_id: qualifyingHabitId ?? null,
                });

                if (!error) {
                    newlyEarned.push({ badge, habitId: qualifyingHabitId });
                    earnedIds.add(badge.id);
                }
            }
        }
    } catch (err) {
        if (__DEV__) console.warn('[BadgeChecker] Error:', err);
    }

    return newlyEarned;
}

function checkPerfectWeek(
    completions: any[],
    habits: any[],
    days: number
): boolean {
    if (habits.length === 0) return false;
    const last7 = getLast30Days().slice(-days);
    for (const date of last7) {
        for (const habit of habits) {
            const done = completions.some((c) => c.habit_id === habit.id && c.date === date);
            if (!done) return false;
        }
    }
    return true;
}

function checkStepStreak(
    stepData: any[],
    stepGoal: number,
    days: number
): boolean {
    const sorted = [...stepData].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    let prevDate: string | null = null;
    for (const s of sorted) {
        if (s.steps < stepGoal) break;
        if (prevDate) {
            const diff = Math.round(
                (new Date(prevDate).getTime() - new Date(s.date).getTime()) / 86400000
            );
            if (diff !== 1) break;
        }
        streak++;
        prevDate = s.date;
        if (streak >= days) return true;
    }
    return false;
}
