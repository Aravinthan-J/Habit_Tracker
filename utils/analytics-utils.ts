import { Completion } from '../db/completion.repository';
import { Habit } from '../db/habit.repository';

export const calculateCompletionRate = (completions: Completion[], habits: Habit[], days: number): number => {
    if (habits.length === 0) return 0;

    const totalPossible = habits.length * days;
    if (totalPossible === 0) return 0;

    return (completions.length / totalPossible) * 100;
};

export const getWeeklyComparison = (completions: Completion[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const currentWeek = Array(7).fill(0);

    completions.forEach(c => {
        const date = new Date(c.date);
        const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 7) {
            currentWeek[date.getDay()]++;
        }
    });

    return {
        labels: dayNames,
        datasets: [{ data: currentWeek }]
    };
};
