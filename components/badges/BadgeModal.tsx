import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useBadgeStore } from '../../store/badge-store';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

export const BadgeModal: React.FC = () => {
    const { isBadgeModalVisible, setBadgeModalVisible, recentBadge } = useBadgeStore();

    if (!recentBadge) return null;

    return (
        <Modal
            visible={isBadgeModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setBadgeModalVisible(false)}
        >
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 items-center w-full max-w-sm relative overflow-hidden">
                    {/* Confetti Animation Placeholder */}
                    <LottieView
                        source={require('../../assets/lottie/confetti.json')}
                        autoPlay
                        loop={false}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}
                    />

                    <View className="bg-yellow-100 dark:bg-yellow-900/30 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <Ionicons name="trophy" size={50} color="#f59e0b" />
                    </View>

                    <Text className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">
                        New Achievement!
                    </Text>

                    <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-4">
                        {recentBadge.name}
                    </Text>

                    <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
                        You've unlocked this badge by staying consistent. Great job!
                    </Text>

                    <TouchableOpacity
                        onPress={() => setBadgeModalVisible(false)}
                        className="bg-indigo-500 py-4 px-8 rounded-2xl w-full items-center shadow-lg"
                    >
                        <Text className="text-white font-bold text-lg">Awesome!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
