/**
 * Badge type definitions and constants
 */

export type BadgeType = 'streak' | 'completion' | 'step' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeDefinition {
  name: string;
  description: string;
  type: BadgeType;
  tier: BadgeTier;
  requirement: number;
  iconName: string;
  category: string;
  tips?: string[];
}

/**
 * Tier colors for badge display
 */
export const TIER_COLORS: Record<BadgeTier, { primary: string; secondary: string; glow: string }> = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#B87333',
    glow: 'rgba(205, 127, 50, 0.3)',
  },
  silver: {
    primary: '#C0C0C0',
    secondary: '#A8A8A8',
    glow: 'rgba(192, 192, 192, 0.3)',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#FFC107',
    glow: 'rgba(255, 215, 0, 0.3)',
  },
  platinum: {
    primary: '#E5E4E2',
    secondary: '#B8B8B8',
    glow: 'rgba(229, 228, 226, 0.5)',
  },
};

/**
 * Type colors for badge categorization
 */
export const TYPE_COLORS: Record<BadgeType, string> = {
  streak: '#FF6B6B',
  completion: '#4ECDC4',
  step: '#45B7D1',
  special: '#96CEB4',
};

/**
 * Badge filter options
 */
export const BADGE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'earned', label: 'Earned' },
  { key: 'locked', label: 'Locked' },
  { key: 'streak', label: 'Streaks' },
  { key: 'completion', label: 'Completions' },
  { key: 'step', label: 'Steps' },
  { key: 'special', label: 'Special' },
] as const;

/**
 * Local badge definitions for display (synced from backend)
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak badges (per habit)
  {
    name: '21-Day Warrior',
    description: 'Maintain a 21-day streak for any habit',
    type: 'streak',
    tier: 'bronze',
    requirement: 21,
    iconName: 'walk', // Example icon, actual icons to be used
    category: 'Streaks',
    tips: [
      'Focus on one habit at a time',
      'Set a daily reminder',
      "Don't break the chain!",
    ],
  },
  {
    name: '45-Day Champion',
    description: 'Maintain a 45-day streak for any habit',
    type: 'streak',
    tier: 'silver',
    requirement: 45,
    iconName: 'trophy',
    category: 'Streaks',
    tips: [
      'You\'re halfway to forming a permanent habit!',
      'Keep your environment supportive',
    ],
  },
  {
    name: '100-Day Legend',
    description: 'Maintain a 100-day streak for any habit',
    type: 'streak',
    tier: 'gold',
    requirement: 100,
    iconName: 'star',
    category: 'Streaks',
    tips: [
      'This is legendary commitment!',
      'Your habit is now automatic',
    ],
  },
  {
    name: '365-Day Master',
    description: 'Maintain a 365-day streak for any habit',
    type: 'streak',
    tier: 'platinum',
    requirement: 365,
    iconName: 'medal',
    category: 'Streaks',
    tips: [
      'Ultimate dedication!',
      'You\'ve mastered consistency',
    ],
  },
  // Completion badges (total completions)
  {
    name: '100 Completions Club',
    description: 'Achieve 100 total habit check-ins across all habits',
    type: 'completion',
    tier: 'bronze',
    requirement: 100,
    iconName: 'checkmark-circle',
    category: 'Completions',
    tips: ['Every small step counts!'],
  },
  {
    name: '500 Completions Club',
    description: 'Achieve 500 total habit check-ins across all habits',
    type: 'completion',
    tier: 'silver',
    requirement: 500,
    iconName: 'checkmark-done-circle',
    category: 'Completions',
  },
  {
    name: '1000 Completions Club',
    description: 'Achieve 1000 total habit check-ins across all habits',
    type: 'completion',
    tier: 'gold',
    requirement: 1000,
    iconName: 'ribbon',
    category: 'Completions',
  },
  {
    name: '5000 Completions Club',
    description: 'Achieve 5000 total habit check-ins across all habits',
    type: 'completion',
    tier: 'platinum',
    requirement: 5000,
    iconName: 'diamond',
    category: 'Completions',
  },
  // Completion badges (specific conditions)
  {
    name: 'Perfect Week',
    description: 'Complete all your habits for 7 consecutive days',
    type: 'completion',
    tier: 'gold',
    requirement: 7, // Represents 7 consecutive days of all habits completed
    iconName: 'calendar',
    category: 'Completions',
    tips: ['Consistency is key!', 'Plan your week ahead.'],
  },
  {
    name: 'Perfect Month',
    description: 'Complete all your habits for a full month (based on monthly goal)',
    type: 'completion',
    tier: 'platinum',
    requirement: 1, // Represents 1 perfect month
    iconName: 'calendar-sharp',
    category: 'Completions',
    tips: ['Monthly review helps to stay on track.'],
  },
  {
    name: 'Comeback Kid',
    description: 'Restart a broken streak within 3 days',
    type: 'completion',
    tier: 'bronze',
    requirement: 3, // Represents 3 days grace period
    iconName: 'refresh-circle',
    category: 'Completions',
    tips: ['Don\'t let a setback define your journey. Get back up!'],
  },
  // Step badges
  {
    name: '10K Walker',
    description: 'Walk 10,000 steps in a single day',
    type: 'step',
    tier: 'bronze',
    requirement: 10000,
    iconName: 'footsteps',
    category: 'Steps',
    tips: ['Take walking meetings', 'Park farther away'],
  },
  {
    name: 'Marathon Month',
    description: 'Average 10,000+ steps per day for 30 consecutive days',
    type: 'step',
    tier: 'gold',
    requirement: 30, // Represents 30 days
    iconName: 'run',
    category: 'Steps',
    tips: ['Challenge yourself with daily walks!', 'Track your progress'],
  },
  {
    name: 'Step Streak 7',
    description: 'Hit your daily step goal for 7 consecutive days',
    type: 'step',
    tier: 'bronze',
    requirement: 7,
    iconName: 'flame',
    category: 'Steps',
  },
  {
    name: 'Step Streak 14',
    description: 'Hit your daily step goal for 14 consecutive days',
    type: 'step',
    tier: 'silver',
    requirement: 14,
    iconName: 'flame',
    category: 'Steps',
  },
  {
    name: 'Step Streak 30',
    description: 'Hit your daily step goal for 30 consecutive days',
    type: 'step',
    tier: 'gold',
    requirement: 30,
    iconName: 'flame',
    category: 'Steps',
  },
  // Distance Milestones
  {
    name: '100 KM Explorer',
    description: 'Accumulate 100 kilometers in total walking distance',
    type: 'step',
    tier: 'bronze',
    requirement: 100, // in kilometers
    iconName: 'map',
    category: 'Steps',
  },
  {
    name: '500 KM Traveler',
    description: 'Accumulate 500 kilometers in total walking distance',
    type: 'step',
    tier: 'silver',
    requirement: 500,
    iconName: 'globe',
    category: 'Steps',
  },
  {
    name: '1000 KM Adventurer',
    description: 'Accumulate 1000 kilometers in total walking distance',
    type: 'step',
    tier: 'gold',
    requirement: 1000,
    iconName: 'earth',
    category: 'Steps',
  },
  {
    name: '5000 KM Pioneer',
    description: 'Accumulate 5000 kilometers in total walking distance',
    type: 'step',
    tier: 'platinum',
    requirement: 5000,
    iconName: 'airplane',
    category: 'Steps',
  },
  // Special badges
  {
    name: 'Early Bird',
    description: 'Complete 7 habits before 9 AM',
    type: 'special',
    tier: 'bronze',
    requirement: 7,
    iconName: 'sunny',
    category: 'Time',
    tips: ['Set morning reminders', 'Prepare the night before'],
  },
  {
    name: 'Night Owl',
    description: 'Complete 7 habits after 9 PM',
    type: 'special',
    tier: 'bronze',
    requirement: 7,
    iconName: 'moon',
    category: 'Time',
  },
  // Add other special badges here as they are defined
];

/**
 * Celebration messages for badge unlocks
 */
export const BADGE_CELEBRATION_MESSAGES: Record<BadgeTier, string[]> = {
  bronze: [
    'Great start! 🎉',
    'You did it! 💪',
    'First of many! ⭐',
  ],
  silver: [
    'Impressive! 🏆',
    'You\'re on fire! 🔥',
    'Keep it up! 🚀',
  ],
  gold: [
    'Outstanding! 🌟',
    'You\'re a legend! 👑',
    'Incredible achievement! 💫',
  ],
  platinum: [
    'Ultimate mastery! 🎊',
    'You\'re unstoppable! 🏅',
    'True dedication! 💎',
  ],
};
