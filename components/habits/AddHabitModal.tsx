import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useHabits } from '../../hooks/useHabits';
import { Habit } from '../../db/habit.repository';
import { getTodayStr } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';

interface AddHabitModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const COLORS = [
    '#6366f1', // Indigo
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isVisible, onClose }) => {
    const [title, setTitle] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const { createHabit } = useHabits();

    const handleCreate = () => {
        if (!title.trim()) return;

        const newHabit: Habit = {
            id: Math.random().toString(36).substring(7),
            title: title.trim(),
            color: selectedColor,
            created_at: getTodayStr(),
            archived: 0,
        };

        createHabit.mutate(newHabit);
        setTitle('');
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[70%]">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-2xl font-bold text-slate-900 dark:text-white">New Habit</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-slate-600 dark:text-slate-400 font-semibold mb-3">Title</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ex: Drink 2L Water"
                                placeholderTextColor="#94a3b8"
                                className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-slate-900 dark:text-white text-lg mb-6"
                                autoFocus
                            />

                            <Text className="text-slate-600 dark:text-slate-400 font-semibold mb-3">Color</Text>
                            <View className="flex-row flex-wrap gap-4 mb-8">
                                {COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={`w-12 h-12 rounded-full items-center justify-center ${selectedColor === color ? 'border-4 border-slate-200 dark:border-slate-600' : ''
                                            }`}
                                    >
                                        {selectedColor === color && (
                                            <Ionicons name="checkmark" size={24} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleCreate}
                                disabled={!title.trim()}
                                className={`p-4 rounded-2xl items-center ${title.trim() ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
                                    }`}
                            >
                                <Text className={`text-lg font-bold ${title.trim() ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Create Habit
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
