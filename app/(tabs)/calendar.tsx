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
import { MonthCalendar, DayData } from '@/components/calendar/MonthCalendar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { getMonthName, getMonthRange, getDaysInMonth, today, friendlyDate } from '@/utils/dateHelpers';

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(today());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const range = getMonthRange(year, month);
  const { habits } = useHabits();
  const { completions } = useCompletions(range.start, range.end);

  const habitMap = useMemo(() => {
    const map: Record<string, { color: string; title: string; icon: string | null }> = {};
    for (const h of habits) map[h.id] = { color: h.color, title: h.title, icon: h.icon };
    return map;
  }, [habits]);

  const filteredCompletions = useMemo(() =>
    selectedHabitId ? completions.filter((c) => c.habit_id === selectedHabitId) : completions,
    [completions, selectedHabitId]
  );

  // Build per-day data for calendar cells
  const dayData = useMemo(() => {
    const result: Record<string, DayData> = {};
    for (const c of filteredCompletions) {
      if (!result[c.date]) result[c.date] = { colors: [], allDone: false };
      const habit = habitMap[c.habit_id];
      if (habit) result[c.date].colors.push(habit.color);
    }
    const habitCount = selectedHabitId ? 1 : habits.length;
    for (const data of Object.values(result)) {
      data.allDone = habitCount > 0 && data.colors.length >= habitCount;
    }
    return result;
  }, [filteredCompletions, habitMap, habits.length, selectedHabitId]);

  // Month stats (always from all completions, not filtered)
  const stats = useMemo(() => {
    const todayStr = today();
    const allDays = getDaysInMonth(year, month);
    const pastDays = allDays.filter((d) => d <= todayStr);
    const totalPossible = pastDays.length * habits.length;
    const totalCompleted = completions.length;
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const perfectDays = pastDays.filter((d) => {
      const count = completions.filter((c) => c.date === d).length;
      return habits.length > 0 && count >= habits.length;
    }).length;

    const activeDays = new Set(completions.map((c) => c.date)).size;

    return { completionRate, perfectDays, activeDays };
  }, [completions, habits.length, year, month]);

  // Selected day detail
  const dayDetail = useMemo(() => {
    if (!selectedDate) return null;
    const completedIds = new Set(
      completions.filter((c) => c.date === selectedDate).map((c) => c.habit_id)
    );
    return habits.map((h) => ({ ...h, completed: completedIds.has(h.id) }));
  }, [selectedDate, completions, habits]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const completedCount = dayDetail?.filter((h) => h.completed).length ?? 0;
  const totalCount = dayDetail?.length ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header + Month Nav */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Calendar</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{getMonthName(month)} {year}</Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBox label="Completion" value={`${stats.completionRate}%`} icon="trending-up-outline" color={COLORS.primary} />
          <View style={styles.statDivider} />
          <StatBox label="Perfect Days" value={String(stats.perfectDays)} icon="checkmark-circle-outline" color={COLORS.success} />
          <View style={styles.statDivider} />
          <StatBox label="Active Days" value={String(stats.activeDays)} icon="flash-outline" color={COLORS.accentOrange} />
        </View>

        {/* Habit filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, !selectedHabitId && styles.chipActive]}
            onPress={() => setSelectedHabitId(null)}
          >
            <Text style={[styles.chipText, !selectedHabitId && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {habits.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={[
                styles.chip,
                selectedHabitId === h.id && { backgroundColor: h.color + 'CC', borderColor: h.color },
              ]}
              onPress={() => setSelectedHabitId(h.id === selectedHabitId ? null : h.id)}
            >
              <View style={[styles.chipDot, { backgroundColor: h.color }]} />
              <Text style={[styles.chipText, selectedHabitId === h.id && styles.chipTextActive]}>
                {h.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Calendar grid */}
        <View style={styles.calendarCard}>
          <MonthCalendar
            year={year}
            month={month}
            dayData={dayData}
            selectedDate={selectedDate}
            onDayPress={setSelectedDate}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success + '40', borderWidth: 1, borderColor: COLORS.success + '40', width: 12, height: 12, borderRadius: 3 }]} />
            <Text style={styles.legendText}>All done</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderWidth: 1.5, borderColor: COLORS.primary, width: 12, height: 12, borderRadius: 3 }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary, width: 12, height: 12, borderRadius: 3 }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        {/* Day Detail */}
        {selectedDate && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailDate}>{friendlyDate(selectedDate)}</Text>
              {totalCount > 0 && (
                <View style={[
                  styles.detailBadge,
                  { backgroundColor: completedCount === totalCount ? COLORS.success + '30' : COLORS.surface },
                ]}>
                  <Text style={[
                    styles.detailBadgeText,
                    { color: completedCount === totalCount ? COLORS.success : COLORS.textMuted },
                  ]}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>
              )}
            </View>

            {dayDetail && dayDetail.length > 0 ? (
              dayDetail.map((h) => (
                <View key={h.id} style={styles.detailRow}>
                  <View style={[styles.detailColorBar, { backgroundColor: h.color }]} />
                  <Text style={styles.detailIcon}>{h.icon ?? '✨'}</Text>
                  <Text style={[styles.detailTitle, !h.completed && { color: COLORS.textMuted }]}>
                    {h.title}
                  </Text>
                  <Ionicons
                    name={h.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={h.completed ? COLORS.success : COLORS.textMuted}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.detailEmpty}>
                {habits.length === 0 ? 'No habits yet' : 'No habits were tracked'}
              </Text>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.bold },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  monthLabel: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, minWidth: 110, textAlign: 'center' },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: COLORS.cardBorder, marginVertical: 4 },
  statValue: { fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold },
  statLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, textAlign: 'center' },

  chips: { paddingHorizontal: SPACING.xl, gap: SPACING.sm, paddingBottom: SPACING.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm },
  chipTextActive: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.semibold },

  calendarCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: {},
  legendText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs },

  detailCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailDate: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold },
  detailBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  detailBadgeText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    gap: SPACING.sm,
  },
  detailColorBar: { width: 3, height: 20, borderRadius: 2 },
  detailIcon: { fontSize: 16, width: 22 },
  detailTitle: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md },
  detailEmpty: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});
