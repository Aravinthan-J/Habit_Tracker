/**
 * Notification constants and templates
 */

export type NotificationType =
  | 'daily_reminder'
  | 'missed_habits'
  | 'weekly_summary'
  | 'badge_unlock'
  | 'step_goal'
  | 'streak_milestone'
  | 'streak_at_risk';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Default notification settings
 */
export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  dailyReminder: {
    enabled: true,
    hour: 20, // 8 PM
    minute: 0,
  },
  weeklySummary: {
    enabled: true,
    dayOfWeek: 0, // Sunday
    hour: 20,
    minute: 0,
  },
  missedHabitsAlert: {
    enabled: true,
    hour: 9,
    minute: 0,
  },
  badgeUnlock: true,
  stepGoal: true,
  streakMilestone: true,
  quietHours: {
    enabled: false,
    start: 22, // 10 PM
    end: 7, // 7 AM
  },
};

/**
 * Notification channel IDs for Android
 */
export const NOTIFICATION_CHANNELS = {
  REMINDERS: 'reminders',
  ACHIEVEMENTS: 'achievements',
  STEPS: 'steps',
  WEEKLY: 'weekly',
} as const;

/**
 * Notification templates
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  daily_reminder: {
    type: 'daily_reminder',
    title: 'Time to check in! 🎯',
    body: 'You have {{count}} habits to complete today',
    data: { screen: 'Home' },
  },
  missed_habits: {
    type: 'missed_habits',
    title: 'You missed some habits yesterday',
    body: "Don't break your streak! You can still catch up today.",
    data: { screen: 'Home' },
  },
  weekly_summary: {
    type: 'weekly_summary',
    title: 'Weekly Check-in 📊',
    body: 'You completed {{completed}} habits this week. {{message}}',
    data: { screen: 'Analytics' },
  },
  badge_unlock: {
    type: 'badge_unlock',
    title: '🏆 Badge Unlocked: {{badgeName}}',
    body: '{{description}}',
    data: { screen: 'Badges', badgeId: '{{badgeId}}' },
  },
  step_goal: {
    type: 'step_goal',
    title: '🚶 Goal Reached! {{steps}} steps',
    body: 'Great job staying active today!',
    data: { screen: 'Steps' },
  },
  streak_milestone: {
    type: 'streak_milestone',
    title: '🔥 {{days}}-Day Streak!',
    body: "You're on fire with {{habitName}}! Keep it going!",
    data: { screen: 'Home' },
  },
  streak_at_risk: {
    type: 'streak_at_risk',
    title: '⚠️ Streak at Risk!',
    body: "Don't lose your {{days}}-day streak on {{habitName}}!",
    data: { screen: 'Home' },
  },
};

/**
 * Motivational messages for daily reminders
 */
export const MOTIVATIONAL_MESSAGES = [
  "Small steps lead to big changes!",
  "You're building something great!",
  "Consistency is key to success!",
  "Every day counts!",
  "You've got this! 💪",
  "Make today count!",
  "Progress, not perfection!",
  "Keep the momentum going!",
  "You're stronger than you think!",
  "One day at a time!",
];

/**
 * Weekly summary messages based on performance
 */
export const WEEKLY_SUMMARY_MESSAGES = {
  excellent: [
    "Outstanding week! You're crushing it!",
    "Incredible consistency! Keep it up!",
    "You're on fire! 🔥",
  ],
  good: [
    "Great progress this week!",
    "You're doing well! Keep pushing!",
    "Solid effort! You've got this!",
  ],
  average: [
    "Good start! Let's aim higher next week!",
    "Room for improvement, but you're on the right track!",
    "Keep building those habits!",
  ],
  needs_improvement: [
    "Every week is a fresh start!",
    "Don't give up! Start small this week.",
    "Tomorrow is a new opportunity!",
  ],
};

/**
 * Get appropriate weekly message based on completion rate
 */
export function getWeeklySummaryMessage(completionRate: number): string {
  let category: keyof typeof WEEKLY_SUMMARY_MESSAGES;

  if (completionRate >= 80) {
    category = 'excellent';
  } else if (completionRate >= 60) {
    category = 'good';
  } else if (completionRate >= 40) {
    category = 'average';
  } else {
    category = 'needs_improvement';
  }

  const messages = WEEKLY_SUMMARY_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get random motivational message
 */
export function getMotivationalMessage(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}
