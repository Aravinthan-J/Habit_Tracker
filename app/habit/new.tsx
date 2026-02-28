import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HabitForm } from '@/components/habits/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

export default function NewHabitScreen() {
  const { createHabit } = useHabits();
  const router = useRouter();

  const handleCreate = async (values: any) => {
    try {
      await createHabit.mutateAsync(values);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not create habit. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Habit</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <HabitForm
          onSubmit={handleCreate}
          onCancel={() => router.back()}
          isLoading={createHabit.isPending}
          submitLabel="Create Habit"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.semibold },
  body: { flex: 1, paddingHorizontal: SPACING.xl },
});
