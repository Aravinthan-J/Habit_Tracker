import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { Habit } from '../../db/habit.repository';
import { HabitCard } from './HabitCard';

interface HabitListProps {
    habits: Habit[];
    onHabitPress?: (habit: Habit) => void;
}

export const HabitList: React.FC<HabitListProps> = ({ habits, onHabitPress }) => {
    if (habits.length === 0) {
        return (
            <View className="flex-1 items-center justify-center mt-12 px-8">
                <Text className="text-slate-400 text-center text-lg">
                    No habits found. Start your journey by adding one!
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <HabitCard
                    habit={item}
                    onPress={() => onHabitPress?.(item)}
                />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        />
    );
};
