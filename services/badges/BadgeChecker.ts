import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/types/badge.types';
import { BADGE_DEFINITIONS } from '@/constants/badges';
import { calculateCurrentStreak } from '@/utils/streakCalculator';
import { getLast30Days } from '@/utils/dateHelpers';

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
        // Fetch already earned badge IDs (badge_id = badge name)
        const earnedSnap = await getDocs(collection(db, 'users', userId, 'user_badges'));
        const earnedIds = new Set(earnedSnap.docs.map((d) => d.data().badge_id as string));

        // Fetch all completions
        const completionsSnap = await getDocs(collection(db, 'users', userId, 'completions'));
        const completions = completionsSnap.docs.map((d) => d.data() as { habit_id: string; date: string; completed_at: string });

        // Fetch all habits
        const habitsSnap = await getDocs(collection(db, 'users', userId, 'habits'));
        const habits = habitsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; created_at: string }));
        const totalHabits = habits.length;

        // Fetch step data
        const stepsSnap = await getDocs(collection(db, 'users', userId, 'step_data'));
        const stepData = stepsSnap.docs.map((d) => d.data() as { steps: number; date: string; distance?: number });

        // Fetch user profile for step goal
        const profileDoc = await getDoc(doc(db, 'users', userId));
        const stepGoal: number = profileDoc.data()?.step_goal ?? 10000;

        for (const def of BADGE_DEFINITIONS) {
            if (earnedIds.has(def.name)) continue;

            let qualified = false;
            let qualifyingHabitId: string | undefined = habitId;

            if (def.type === 'streak') {
                const habitsToCheck = habitId ? [{ id: habitId }] : habits;
                for (const h of habitsToCheck) {
                    const dates = completions.filter((c) => c.habit_id === h.id).map((c) => c.date);
                    if (calculateCurrentStreak(dates) >= def.requirement) {
                        qualified = true;
                        qualifyingHabitId = h.id;
                        break;
                    }
                }
            } else if (def.type === 'completion') {
                if (def.name.includes('Completions Club')) {
                    qualified = completions.length >= def.requirement;
                } else if (def.name === 'Perfect Week') {
                    qualified = checkPerfectWeek(completions, habits, 7);
                }
            } else if (def.type === 'step') {
                if (def.name === '10K Walker') {
                    qualified = stepData.some((s) => s.steps >= 10000);
                } else if (def.name === 'Step Streak - Week') {
                    qualified = checkStepStreak(stepData, stepGoal, 7);
                } else if (def.name === 'Step Streak - 2 Weeks') {
                    qualified = checkStepStreak(stepData, stepGoal, 14);
                } else if (def.name === 'Step Streak - Month') {
                    qualified = checkStepStreak(stepData, stepGoal, 30);
                } else if (def.name === '100km Milestone') {
                    qualified = stepData.reduce((sum, s) => sum + (s.distance ?? 0), 0) >= 100;
                } else if (def.name === '500km Milestone') {
                    qualified = stepData.reduce((sum, s) => sum + (s.distance ?? 0), 0) >= 500;
                }
            } else if (def.type === 'special') {
                if (def.name === 'Habit Collector' || def.name === 'Power User') {
                    qualified = totalHabits >= def.requirement;
                } else if (def.name === 'Consistency King') {
                    let activeStreaks = 0;
                    for (const h of habits) {
                        const dates = completions.filter((c) => c.habit_id === h.id).map((c) => c.date);
                        if (calculateCurrentStreak(dates) >= 3) activeStreaks++;
                    }
                    qualified = activeStreaks >= def.requirement;
                }
            }

            if (qualified) {
                try {
                    await addDoc(collection(db, 'users', userId, 'user_badges'), {
                        badge_id: def.name,
                        user_id: userId,
                        habit_id: qualifyingHabitId ?? null,
                        earned_at: new Date().toISOString(),
                    });

                    const badge: Badge = {
                        id: def.name,
                        name: def.name,
                        description: def.description,
                        type: def.type,
                        tier: def.tier,
                        requirement: def.requirement,
                        icon_name: def.icon_name,
                        created_at: new Date().toISOString(),
                    };

                    newlyEarned.push({ badge, habitId: qualifyingHabitId });
                    earnedIds.add(def.name);
                } catch {
                    // ignore write errors for individual badges
                }
            }
        }
    } catch (err) {
        if (__DEV__) console.warn('[BadgeChecker] Error:', err);
    }

    return newlyEarned;
}

function checkPerfectWeek(
    completions: { habit_id: string; date: string }[],
    habits: { id: string }[],
    days: number
): boolean {
    if (habits.length === 0) return false;
    const last7 = getLast30Days().slice(-days);
    for (const date of last7) {
        for (const habit of habits) {
            if (!completions.some((c) => c.habit_id === habit.id && c.date === date)) return false;
        }
    }
    return true;
}

function checkStepStreak(
    stepData: { steps: number; date: string }[],
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
