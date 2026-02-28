import { Completion } from '../db/completion.repository';
import { formatDate } from './date';

export const calculateStreak = (completions: Completion[]): number => {
    if (completions.length === 0) return 0;

    const sortedDates = completions
        .map(c => c.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    // If haven't completed today AND didn't complete yesterday, streak is 0
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
        return 0;
    }

    let streak = 0;
    let currentCheck = new Date(sortedDates[0]);

    for (const dateStr of sortedDates) {
        const date = new Date(dateStr);

        // Check if date is consecutive
        const diffTime = currentCheck.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            streak++;
            currentCheck = date;
        } else {
            break;
        }
    }

    return streak;
};
