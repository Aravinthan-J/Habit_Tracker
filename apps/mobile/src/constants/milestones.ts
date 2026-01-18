/**
 * Milestone definitions for habit tracking
 */

export interface Milestone {
  days: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  celebrationDuration: number; // ms
}

/**
 * Streak milestones
 */
export const STREAK_MILESTONES: Milestone[] = [
  {
    days: 3,
    name: 'Getting Started',
    description: '3 days strong!',
    icon: 'leaf',
    color: '#81C784',
    celebrationDuration: 1000,
  },
  {
    days: 7,
    name: 'One Week',
    description: 'A full week of consistency!',
    icon: 'flame',
    color: '#FF8A65',
    celebrationDuration: 1500,
  },
  {
    days: 14,
    name: 'Two Weeks',
    description: "You're building momentum!",
    icon: 'rocket',
    color: '#64B5F6',
    celebrationDuration: 1500,
  },
  {
    days: 21,
    name: '21-Day Habit',
    description: 'The habit is forming!',
    icon: 'shield-checkmark',
    color: '#FFB74D',
    celebrationDuration: 2000,
  },
  {
    days: 30,
    name: 'One Month',
    description: 'A full month!',
    icon: 'calendar',
    color: '#BA68C8',
    celebrationDuration: 2000,
  },
  {
    days: 45,
    name: '45-Day Champion',
    description: "You're unstoppable!",
    icon: 'trophy',
    color: '#4DB6AC',
    celebrationDuration: 2500,
  },
  {
    days: 60,
    name: 'Two Months',
    description: '60 days of dedication!',
    icon: 'fitness',
    color: '#7986CB',
    celebrationDuration: 2500,
  },
  {
    days: 90,
    name: 'Quarter Year',
    description: "90 days! You're a legend!",
    icon: 'star',
    color: '#FFD54F',
    celebrationDuration: 3000,
  },
  {
    days: 100,
    name: 'Century Club',
    description: '100 days of consistency!',
    icon: 'medal',
    color: '#FF7043',
    celebrationDuration: 3000,
  },
  {
    days: 180,
    name: 'Half Year',
    description: '6 months strong!',
    icon: 'ribbon',
    color: '#4DD0E1',
    celebrationDuration: 3500,
  },
  {
    days: 365,
    name: 'Full Year',
    description: 'A complete year of mastery!',
    icon: 'diamond',
    color: '#E040FB',
    celebrationDuration: 4000,
  },
];

/**
 * Completion milestones
 */
export const COMPLETION_MILESTONES: Milestone[] = [
  {
    days: 10,
    name: 'First Ten',
    description: '10 completions!',
    icon: 'checkmark-circle',
    color: '#81C784',
    celebrationDuration: 1000,
  },
  {
    days: 50,
    name: 'Fifty Strong',
    description: '50 completions!',
    icon: 'checkmark-done',
    color: '#64B5F6',
    celebrationDuration: 1500,
  },
  {
    days: 100,
    name: 'Century',
    description: '100 completions!',
    icon: 'checkmark-done-circle',
    color: '#FFB74D',
    celebrationDuration: 2000,
  },
  {
    days: 500,
    name: 'High Achiever',
    description: '500 completions!',
    icon: 'ribbon',
    color: '#BA68C8',
    celebrationDuration: 2500,
  },
  {
    days: 1000,
    name: 'Thousand Club',
    description: '1000 completions!',
    icon: 'trophy',
    color: '#FFD54F',
    celebrationDuration: 3000,
  },
  {
    days: 5000,
    name: 'Elite',
    description: '5000 completions!',
    icon: 'diamond',
    color: '#E040FB',
    celebrationDuration: 4000,
  },
];

/**
 * Step milestones
 */
export const STEP_MILESTONES: Milestone[] = [
  {
    days: 5000,
    name: 'Active Day',
    description: '5,000 steps!',
    icon: 'walk',
    color: '#81C784',
    celebrationDuration: 1000,
  },
  {
    days: 10000,
    name: '10K Club',
    description: '10,000 steps in a day!',
    icon: 'footsteps',
    color: '#64B5F6',
    celebrationDuration: 2000,
  },
  {
    days: 15000,
    name: 'Power Walker',
    description: '15,000 steps!',
    icon: 'speedometer',
    color: '#FFB74D',
    celebrationDuration: 2500,
  },
  {
    days: 20000,
    name: 'Marathon Day',
    description: '20,000 steps!',
    icon: 'flame',
    color: '#FF7043',
    celebrationDuration: 3000,
  },
  {
    days: 30000,
    name: 'Ultra Walker',
    description: '30,000 steps! Incredible!',
    icon: 'rocket',
    color: '#E040FB',
    celebrationDuration: 3500,
  },
];

/**
 * Get the next milestone for a given streak
 */
export function getNextStreakMilestone(currentStreak: number): Milestone | null {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak) || null;
}

/**
 * Get the next milestone for completions
 */
export function getNextCompletionMilestone(
  currentCompletions: number
): Milestone | null {
  return COMPLETION_MILESTONES.find((m) => m.days > currentCompletions) || null;
}

/**
 * Get the next step milestone
 */
export function getNextStepMilestone(currentSteps: number): Milestone | null {
  return STEP_MILESTONES.find((m) => m.days > currentSteps) || null;
}

/**
 * Check if a milestone was just reached
 */
export function checkMilestoneReached(
  previousValue: number,
  currentValue: number,
  milestones: Milestone[]
): Milestone | null {
  return (
    milestones.find((m) => previousValue < m.days && currentValue >= m.days) ||
    null
  );
}

/**
 * Calculate days until next streak milestone
 */
export function daysUntilNextMilestone(currentStreak: number): number | null {
  const next = getNextStreakMilestone(currentStreak);
  return next ? next.days - currentStreak : null;
}
