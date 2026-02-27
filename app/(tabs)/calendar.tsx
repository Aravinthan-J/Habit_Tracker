import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { getMonthName, getMonthRange } from '@/utils/dateHelpers';

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const range = getMonthRange(year, month);
  const { habits } = useHabits();
  const { completions } = useCompletions(range.start, range.end);

  const filteredCompletions = useMemo(() => {
    if (!selectedHabitId) return completions;
    return completions.filter((c) => c.habit_id === selectedHabitId);
  }, [completions, selectedHabitId]);

  const completedDates = filteredCompletions.map((c) => c.date);

  const habitColors: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of completions) {
      const habit = habits.find((h) => h.id === c.habit_id);
      if (habit) map[c.date] = habit.color;
    }
    return map;
  }, [completions, habits]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
        </View>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} accessibilityLabel="Previous month">
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{getMonthName(month)} {year}</Text>
          <TouchableOpacity onPress={nextMonth} accessibilityLabel="Next month">
            <Ionicons name="chevron-forward" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <MonthCalendar
            year={year}
            month={month}
            completedDates={completedDates}
            habitColors={habitColors}
          />
        </View>

        {/* Habit filter */}
        <Text style={styles.sectionTitle}>Filter by Habit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, !selectedHabitId && styles.chipActive]}
            onPress={() => setSelectedHabitId(null)}
            accessibilityLabel="Show all habits"
          >
            <Text style={[styles.chipText, !selectedHabitId && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {habits.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={[
                styles.chip,
                selectedHabitId === h.id && { backgroundColor: h.color },
              ]}
              onPress={() => setSelectedHabitId(h.id === selectedHabitId ? null : h.id)}
              accessibilityLabel={`Filter by ${h.title}`}
            >
              <Text style={styles.chipText}>{h.icon ?? '✨'} {h.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Monthly summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {completedDates.length} completions in {getMonthName(month, true)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, paddingBottom: 0 },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
  },
  calendarCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.xl,
    letterSpacing: 0.5,
  },
  chips: { paddingHorizontal: SPACING.xl, gap: SPACING.sm, paddingBottom: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm },
  chipTextActive: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.semibold },
  summary: { margin: SPACING.xl, alignItems: 'center' },
  summaryText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm },
});
