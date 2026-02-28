import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-4 pt-4">
                <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Calendar</Text>
                <Text className="text-slate-500">History view coming soon...</Text>
            </View>
        </SafeAreaView>
    );
}
