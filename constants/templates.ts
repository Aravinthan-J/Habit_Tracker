export type HabitTemplate = {
    title: string;
    description: string;
    icon: string;
    color: string;
    monthly_goal: number;
    category: 'Health' | 'Productivity' | 'Mindfulness' | 'Personal';
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
    {
        title: 'Morning Meditation',
        description: 'Start your day with 10 minutes of mindfulness.',
        icon: '☀️',
        color: '#FF9A3C',
        monthly_goal: 20,
        category: 'Mindfulness',
    },
    {
        title: 'Deep Work Session',
        description: '90 minutes of focused, uninterrupted work.',
        icon: '💻',
        color: '#6C63FF',
        monthly_goal: 15,
        category: 'Productivity',
    },
    {
        title: 'Drink Water',
        description: 'Stay hydrated throughout the day.',
        icon: '💧',
        color: '#06B6D4',
        monthly_goal: 25,
        category: 'Health',
    },
    {
        title: 'Read 20 Pages',
        description: 'Keep growing by reading every day.',
        icon: '📚',
        color: '#A855F7',
        monthly_goal: 18,
        category: 'Personal',
    },
    {
        title: 'Evening Reflection',
        description: 'Jot down 3 wins from today.',
        icon: '🌙',
        color: '#FF6584',
        monthly_goal: 22,
        category: 'Mindfulness',
    },
];
