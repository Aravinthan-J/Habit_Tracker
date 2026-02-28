import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../../hooks/useHabits';
import { HabitList } from '../../components/habits/HabitList';
import { AddHabitModal } from '../../components/habits/AddHabitModal';
import { StepCounter } from '../../components/steps/StepCounter';
import { Ionicons } from '@expo/vector-icons';

export default function TodayScreen() {
    const [isModalVisible, setModalVisible] = useState(false);
    const { habits, isLoading } = useHabits();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="flex-1 px-4 pt-4">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-3xl font-bold text-slate-900 dark:text-white">Today</Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-indigo-500 w-10 h-10 rounded-full items-center justify-center shadow-lg"
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <StepCounter />

                    <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">
                        Your Habits
                    </Text>

                    {isLoading ? (
                        <View className="items-center justify-center py-8">
                            <Text className="text-slate-400">Loading habits...</Text>
                        </View>
                    ) : (
                        <HabitList habits={habits} />
                    )}
                </ScrollView>
            </View>

            <AddHabitModal
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
}
