export const NOTIFICATION_TEMPLATES = {
    dailyReminder: {
        title: '🎯 Time to check in!',
        body: "Don't break your streak — mark your habits now.",
    },
    streakWarning: (habitTitle: string, streak: number) => ({
        title: `🔥 ${streak}-day streak at risk!`,
        body: `Complete "${habitTitle}" before midnight to keep your streak.`,
    }),
    badgeUnlocked: (badgeName: string) => ({
        title: '🏆 New badge unlocked!',
        body: `You just earned "${badgeName}". Amazing work!`,
    }),
    streakMilestone: (habitTitle: string, streak: number) => ({
        title: `🎉 ${streak}-day streak!`,
        body: `Keep it up with "${habitTitle}"! You're on fire!`,
    }),
    stepGoalReached: (steps: number) => ({
        title: '👟 Step goal reached!',
        body: `You walked ${steps.toLocaleString()} steps today. Outstanding!`,
    }),
};

export const NOTIFICATION_IDENTIFIERS = {
    dailyReminder: 'daily-reminder',
    habitReminder: (habitId: string) => `habit-reminder-${habitId}`,
};
