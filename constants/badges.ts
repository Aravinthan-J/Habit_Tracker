import { BadgeDefinition } from '@/types/badge.types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // Streak badges
    { name: '21-Day Warrior', description: 'Complete any habit for 21 consecutive days', type: 'streak', tier: 'bronze', requirement: 21, icon_name: 'fire-bronze' },
    { name: '45-Day Champion', description: 'Complete any habit for 45 consecutive days', type: 'streak', tier: 'silver', requirement: 45, icon_name: 'fire-silver' },
    { name: '100-Day Legend', description: 'Complete any habit for 100 consecutive days', type: 'streak', tier: 'gold', requirement: 100, icon_name: 'fire-gold' },
    { name: '365-Day Master', description: 'Complete any habit for an entire year', type: 'streak', tier: 'platinum', requirement: 365, icon_name: 'fire-platinum' },

    // Completion badges
    { name: 'Perfect Week', description: 'Complete all active habits for 7 consecutive days', type: 'completion', tier: 'bronze', requirement: 7, icon_name: 'calendar-check' },
    { name: 'Perfect Month', description: 'Achieve monthly goal for all habits in one month', type: 'completion', tier: 'silver', requirement: 1, icon_name: 'calendar-star' },
    { name: 'Comeback Kid', description: 'Restart a habit within 3 days of breaking a streak', type: 'completion', tier: 'bronze', requirement: 1, icon_name: 'refresh' },
    { name: 'Early Bird', description: 'Complete 7 check-ins before 9 AM', type: 'completion', tier: 'bronze', requirement: 7, icon_name: 'sunrise' },
    { name: 'Night Owl', description: 'Complete 7 check-ins after 9 PM', type: 'completion', tier: 'bronze', requirement: 7, icon_name: 'moon' },
    { name: '100 Completions Club', description: 'Total 100 habit completions', type: 'completion', tier: 'bronze', requirement: 100, icon_name: 'trophy-bronze' },
    { name: '500 Completions Club', description: 'Total 500 habit completions', type: 'completion', tier: 'silver', requirement: 500, icon_name: 'trophy-silver' },
    { name: '1000 Completions Club', description: 'Total 1000 habit completions', type: 'completion', tier: 'gold', requirement: 1000, icon_name: 'trophy-gold' },
    { name: '5000 Completions Club', description: 'Total 5000 habit completions', type: 'completion', tier: 'platinum', requirement: 5000, icon_name: 'trophy-platinum' },

    // Step badges
    { name: '10K Walker', description: 'Hit 10,000 steps in a single day', type: 'step', tier: 'bronze', requirement: 10000, icon_name: 'walk' },
    { name: 'Marathon Month', description: 'Average 10,000+ steps for 30 consecutive days', type: 'step', tier: 'silver', requirement: 30, icon_name: 'run' },
    { name: 'Step Streak - Week', description: '7 consecutive days hitting step goal', type: 'step', tier: 'bronze', requirement: 7, icon_name: 'footsteps-bronze' },
    { name: 'Step Streak - 2 Weeks', description: '14 consecutive days hitting step goal', type: 'step', tier: 'silver', requirement: 14, icon_name: 'footsteps-silver' },
    { name: 'Step Streak - Month', description: '30 consecutive days hitting step goal', type: 'step', tier: 'gold', requirement: 30, icon_name: 'footsteps-gold' },
    { name: '100km Milestone', description: 'Walk 100 kilometers total', type: 'step', tier: 'bronze', requirement: 100, icon_name: 'map-bronze' },
    { name: '500km Milestone', description: 'Walk 500 kilometers total', type: 'step', tier: 'silver', requirement: 500, icon_name: 'map-silver' },
    { name: '1000km Milestone', description: 'Walk 1000 kilometers total', type: 'step', tier: 'gold', requirement: 1000, icon_name: 'map-gold' },

    // Special badges
    { name: 'Habit Collector', description: 'Create 10 different habits', type: 'special', tier: 'bronze', requirement: 10, icon_name: 'collection' },
    { name: 'Weekend Warrior', description: 'Complete all habits on 4 consecutive weekends', type: 'special', tier: 'silver', requirement: 4, icon_name: 'weekend' },
    { name: 'Consistency King', description: 'Maintain 3 active streaks simultaneously', type: 'special', tier: 'gold', requirement: 3, icon_name: 'crown' },
    { name: 'Early Adopter', description: 'Use the app for 30 consecutive days', type: 'special', tier: 'bronze', requirement: 30, icon_name: 'star' },
    { name: 'Power User', description: 'Track 20+ different habits', type: 'special', tier: 'silver', requirement: 20, icon_name: 'lightning' },
    { name: 'Year Strong', description: 'Use the app for 365 consecutive days', type: 'special', tier: 'platinum', requirement: 365, icon_name: 'diamond' },
    { name: 'Social Butterfly', description: 'Share 5 achievements', type: 'special', tier: 'bronze', requirement: 5, icon_name: 'share' },
    { name: 'Data Driven', description: 'View analytics 50 times', type: 'special', tier: 'bronze', requirement: 50, icon_name: 'chart' },
    { name: 'Streak Protector', description: 'Save a streak 5 times', type: 'special', tier: 'silver', requirement: 5, icon_name: 'shield' },
];

export const TIER_COLORS = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
};

export const TIER_GLOW = {
    bronze: 'rgba(205, 127, 50, 0.3)',
    silver: 'rgba(192, 192, 192, 0.3)',
    gold: 'rgba(255, 215, 0, 0.3)',
    platinum: 'rgba(229, 228, 226, 0.3)',
};
