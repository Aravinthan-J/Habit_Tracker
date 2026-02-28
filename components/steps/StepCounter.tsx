import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useSteps } from '../../hooks/useSteps';

export const StepCounter: React.FC = () => {
    const { steps, goal } = useSteps();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const size = 200;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(steps / goal, 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View className="items-center justify-center py-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm mx-4 mb-6">
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size}>
                    {/* Background Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={isDark ? '#1e293b' : '#f1f5f9'}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#6366f1"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>
                <View className="absolute items-center justify-center">
                    <Text className="text-4xl font-bold text-slate-900 dark:text-white">
                        {steps.toLocaleString()}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                        / {goal.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View className="mt-4 items-center">
                <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                    {Math.round(progress * 100)}% of goal
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Keep moving to reach your target!
                </Text>
            </View>
        </View>
    );
};
