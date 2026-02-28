import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Habit } from '../../db/habit.repository';
import { Ionicons } from '@expo/vector-icons';
import { useCompletions } from '../../hooks/useCompletions';
import { getTodayStr } from '../../utils/date';

interface HabitCardProps {
    habit: Habit;
    onPress?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress }) => {
    const { toggleCompletion, isTodayCompleted } = useCompletions(habit.id);
    const completed = isTodayCompleted(habit.id);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleToggle = () => {
        toggleCompletion.mutate({ id: habit.id, date: getTodayStr() });
    };

    return (
        <View className="mb-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex-row items-center justify-between">
            <TouchableOpacity
                onPress={onPress}
                className="flex-1 flex-row items-center"
            >
                <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${habit.color}20` }}
                >
                    <Ionicons name="flash" size={24} color={habit.color} />
                </View>
                <View>
                    <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                        {habit.title}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                        Daily Habit
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleToggle}
                className={`w-10 h-10 rounded-full items-center justify-center ${completed ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'
                    }`}
            >
                <Ionicons
                    name={completed ? "checkmark" : "add"}
                    size={24}
                    color={completed ? "#fff" : (isDark ? "#94a3b8" : "#64748b")}
                />
            </TouchableOpacity>
        </View>
    );
};
