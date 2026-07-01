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
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { useHabitNotes } from '@/hooks/useHabitNotes';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitStats } from '@/components/habits/HabitStats';
import { HabitMonthHeatmap } from '@/components/habits/HabitMonthHeatmap';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { calculateCurrentStreak, calculateLongestStreak, completionRate } from '@/utils/streakCalculator';
import { calculateWeeklyStreak, calculateLongestWeeklyStreak, weeksCompletedInMonth } from '@/utils/frequency';
import { today } from '@/utils/dateHelpers';
import { resolveIcon } from '@/utils/iconHelpers';

export default function HabitDetailScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, updateHabit, deleteHabit } = useHabits();
  const { completions } = useCompletions();
  const notesQuery = useHabitNotes(id ?? '');
  const [editing, setEditing] = useState(false);

  const habit = habits.find((h) => h.id === id);
  if (!habit) return <LoadingSpinner />;

  const habitCompletionDates = completions.filter((c) => c.habit_id === id).map((c) => c.date);
  const weekly = habit.frequency === 'weekly';
  const currentStreak = weekly
    ? calculateWeeklyStreak(habitCompletionDates)
    : calculateCurrentStreak(habitCompletionDates);
  const longestStreak = weekly
    ? calculateLongestWeeklyStreak(habitCompletionDates)
    : calculateLongestStreak(habitCompletionDates);
  const rate = completionRate(habitCompletionDates, 30);
  const currentMonth = today().slice(0, 7);
  const monthlyCount = weekly
    ? weeksCompletedInMonth(habitCompletionDates, currentMonth)
    : habitCompletionDates.filter((d) => d.startsWith(currentMonth)).length;
  const streakUnit = weekly ? 'week' : 'day';

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
        {/* Hero banner */}
        <LinearGradient
          colors={[habit.color, habit.color + 'AA'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Text style={styles.habitEmoji}>{resolveIcon(habit.icon)}</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={1}>{habit.title}</Text>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🔥 {currentStreak} {streakUnit} streak</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🎯 {monthlyCount}/{habit.monthly_goal} {weekly ? 'weeks ' : ''}this month</Text>
            </View>
          </View>
        </LinearGradient>

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
              unit={weekly ? 'w' : 'd'}
            />

            <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>History</Text>
            <HabitMonthHeatmap completionDates={habitCompletionDates} color={habit.color} />

            {notesQuery.data && notesQuery.data.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Check-in Notes</Text>
                <View style={[styles.notesCard, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
                  {notesQuery.data.map((n, i) => (
                    <View key={n.date} style={[styles.noteRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.cardBorder }]}>
                      <Text style={[styles.noteDate, { color: COLORS.textMuted }]}>{n.date}</Text>
                      <Text style={[styles.noteText, { color: COLORS.textPrimary }]}>{n.note}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

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

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
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
  hero: {
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  habitEmoji: { fontSize: 40 },
  heroTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
    maxWidth: '90%',
  },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md, justifyContent: 'center' },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.lg,
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },
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
  notesCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  noteRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  noteDate: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: 3,
  },
  noteText: {
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 20,
  },
});
