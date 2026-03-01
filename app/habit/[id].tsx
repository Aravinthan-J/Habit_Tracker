import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitStats } from '@/components/habits/HabitStats';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { calculateCurrentStreak, calculateLongestStreak, completionRate } from '@/utils/streakCalculator';
import { today } from '@/utils/dateHelpers';
import { resolveIcon } from '@/utils/iconHelpers';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, updateHabit, deleteHabit } = useHabits();
  const { completions } = useCompletions();
  const [editing, setEditing] = useState(false);

  const habit = habits.find((h) => h.id === id);
  if (!habit) return <LoadingSpinner />;

  const habitCompletionDates = completions.filter((c) => c.habit_id === id).map((c) => c.date);
  const currentStreak = calculateCurrentStreak(habitCompletionDates);
  const longestStreak = calculateLongestStreak(habitCompletionDates);
  const rate = completionRate(habitCompletionDates, 30);
  const currentMonth = today().slice(0, 7);
  const monthlyCount = habitCompletionDates.filter((d) => d.startsWith(currentMonth)).length;

  const handleUpdate = async (values: any) => {
    await updateHabit.mutateAsync({ id: habit.id, ...values });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', `Delete "${habit.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit.mutateAsync(habit.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{habit.title}</Text>
        <TouchableOpacity
          onPress={() => setEditing((e) => !e)}
          accessibilityLabel={editing ? 'Cancel editing' : 'Edit habit'}
        >
          <Ionicons name={editing ? 'close-circle-outline' : 'pencil-outline'} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Color accent banner */}
        <View style={[styles.colorBanner, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.habitEmoji}>{resolveIcon(habit.icon)}</Text>
          <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
        </View>

        {/* Stats */}
        {!editing && (
          <>
            <Text style={styles.sectionTitle}>Stats</Text>
            <HabitStats
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              totalCompletions={habitCompletionDates.length}
              completionRate={rate}
              color={habit.color}
              monthlyGoal={habit.monthly_goal}
              monthlyCount={monthlyCount}
            />

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              accessibilityLabel="Delete habit"
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={styles.deleteBtnText}>Delete Habit</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Edit form */}
        {editing && (
          <>
            <Text style={styles.sectionTitle}>Edit Habit</Text>
            <HabitForm
              initialValues={habit}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              isLoading={updateHabit.isPending}
              submitLabel="Save Changes"
            />
          </>
        )}
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
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    flex: 1,
    textAlign: 'center',
  },
  body: { flex: 1, paddingHorizontal: SPACING.xl },
  colorBanner: {
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  habitEmoji: { fontSize: 48 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.medium,
  },
});
