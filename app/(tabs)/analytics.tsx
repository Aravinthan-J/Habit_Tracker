import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
    const { data, isLoading } = useAnalytics();
    const screenWidth = Dimensions.get('window').width;

    if (isLoading || !data) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
                <Text className="text-slate-400">Loading analytics...</Text>
            </SafeAreaView>
        );
    }

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.6,
        useShadowColorFromDataset: false,
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Analytics</Text>

                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <Text className="text-slate-500 dark:text-slate-400 text-xs mb-1">Completion Rate</Text>
                        <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {Math.round(data.completionRate)}%
                        </Text>
                    </View>
                    <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <Text className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total Steps</Text>
                        <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {data.totalSteps.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Weekly Activity</Text>
                <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 items-center mb-6">
                    <BarChart
                        data={data.weeklyData}
                        width={screenWidth - 64}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        verticalLabelRotation={0}
                        fromZero={true}
                    />
                </View>

                <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 mb-8">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">Insights</Text>
                    <Text className="text-slate-500 dark:text-slate-400">
                        {data.completionRate > 80
                            ? "You're doing amazing! Keep up the consistency."
                            : "Try to complete your habits earlier in the day to improve your rate."}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
