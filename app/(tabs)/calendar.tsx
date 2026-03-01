import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { MonthCalendar, DayData } from '@/components/calendar/MonthCalendar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { getMonthName, getMonthRange, getDaysInMonth, today, friendlyDate } from '@/utils/dateHelpers';
import { resolveIcon } from '@/utils/iconHelpers';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;
const STEP_GOAL = 10000;

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const { user } = useAuthStore();

  const range = getMonthRange(year, month);
  const { habits } = useHabits();
  const { completions } = useCompletions(range.start, range.end);

  // Fetch step data for the selected date
  const stepQuery = useQuery({
    queryKey: ['step-day', user?.uid, selectedDate],
    queryFn: async () => {
      if (!user || !selectedDate) return null;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'step_data', selectedDate));
        return snap.exists() ? snap.data() : null;
      } catch {
        return null;
      }
    },
    enabled: !!user && !!selectedDate,
  });

  const habitMap = useMemo(() => {
    const map: Record<string, { color: string; title: string; icon: string | null }> = {};
    for (const h of habits) map[h.id] = { color: h.color, title: h.title, icon: h.icon };
    return map;
  }, [habits]);

  const filteredCompletions = useMemo(() =>
    selectedHabitId ? completions.filter((c) => c.habit_id === selectedHabitId) : completions,
    [completions, selectedHabitId]
  );

  const dayData = useMemo(() => {
    const result: Record<string, DayData> = {};
    for (const c of filteredCompletions) {
      if (!result[c.date]) result[c.date] = { colors: [], allDone: false };
      const habit = habitMap[c.habit_id];
      if (habit) result[c.date].colors.push(habit.color);
    }
    for (const [date, data] of Object.entries(result)) {
      const habitCount = selectedHabitId
        ? 1
        : habits.filter((h) => !h.created_at || h.created_at.slice(0, 10) <= date).length;
      data.allDone = habitCount > 0 && data.colors.length >= habitCount;
    }
    return result;
  }, [filteredCompletions, habitMap, habits, selectedHabitId]);

  const stats = useMemo(() => {
    const activeIds = new Set(habits.map((h) => h.id));
    const todayStr = today();
    const pastDays = getDaysInMonth(year, month).filter((d) => d <= todayStr);

    // Per-day: only count habits that existed on that day
    let totalPossible = 0;
    let totalCompleted = 0;
    const perfectDays = pastDays.filter((d) => {
      const habitsOnDay = habits.filter((h) => !h.created_at || h.created_at.slice(0, 10) <= d);
      if (habitsOnDay.length === 0) return false;
      const doneCount = completions.filter((c) => c.date === d && activeIds.has(c.habit_id)).length;
      totalPossible += habitsOnDay.length;
      totalCompleted += Math.min(doneCount, habitsOnDay.length);
      return doneCount >= habitsOnDay.length;
    }).length;

    const completionRate = totalPossible > 0
      ? Math.min(Math.round((totalCompleted / totalPossible) * 100), 100)
      : 0;
    const activeDays = new Set(
      completions.filter((c) => activeIds.has(c.habit_id)).map((c) => c.date)
    ).size;
    return { completionRate, perfectDays, activeDays };
  }, [completions, habits, year, month]);

  const dayDetail = useMemo(() => {
    if (!selectedDate) return null;
    const completedIds = new Set(
      completions.filter((c) => c.date === selectedDate).map((c) => c.habit_id)
    );
    const monthStr = selectedDate.slice(0, 7);
    // Only include habits that existed on the selected date
    return habits
      .filter((h) => !h.created_at || h.created_at.slice(0, 10) <= selectedDate)
      .map((h) => {
        const monthlyCount = completions.filter(
          (c) => c.habit_id === h.id && c.date.startsWith(monthStr)
        ).length;
        return {
          ...h,
          completed: completedIds.has(h.id),
          goalReached: h.monthly_goal > 0 && monthlyCount >= h.monthly_goal,
        };
      });
  }, [selectedDate, completions, habits]);

  // Sheet animation helpers
  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    openSheet();
  };

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

  const completed = dayDetail?.filter((h) => h.completed) ?? [];
  const incomplete = dayDetail?.filter((h) => !h.completed) ?? [];
  const stepData = stepQuery.data;
  const steps = stepData?.steps ?? 0;
  const stepPct = Math.min(steps / STEP_GOAL, 1);

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
            onDayPress={handleDayPress}
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

      </ScrollView>

      {/* Slide-up Day Detail Sheet */}
      <Modal visible={sheetVisible} transparent animationType="none" onRequestClose={closeSheet}>
        {/* Backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetDate}>{selectedDate ? friendlyDate(selectedDate) : ''}</Text>
              {dayDetail && dayDetail.length > 0 && (
                <Text style={styles.sheetSubtitle}>
                  {completed.length}/{dayDetail.length} habits completed
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>

            {/* Steps Section */}
            <View style={styles.sheetSection}>
              <View style={styles.sheetSectionHeader}>
                <Text style={styles.sheetSectionIcon}>👟</Text>
                <Text style={styles.sheetSectionTitle}>Steps</Text>
                <Text style={[styles.sheetSectionBadge, { color: steps >= STEP_GOAL ? COLORS.success : COLORS.textMuted }]}>
                  {steps.toLocaleString()} / {STEP_GOAL.toLocaleString()}
                </Text>
              </View>

              {/* Progress bar */}
              <View style={styles.stepTrack}>
                <View style={[styles.stepFill, {
                  width: `${stepPct * 100}%` as any,
                  backgroundColor: steps >= STEP_GOAL ? COLORS.success : COLORS.primary,
                }]} />
              </View>

              {/* Extra stats */}
              {(stepData?.distance || stepData?.calories || stepData?.active_minutes) ? (
                <View style={styles.stepExtras}>
                  {stepData?.distance != null && (
                    <View style={styles.stepExtra}>
                      <Text style={styles.stepExtraValue}>{(stepData.distance / 1000).toFixed(1)} km</Text>
                      <Text style={styles.stepExtraLabel}>Distance</Text>
                    </View>
                  )}
                  {stepData?.calories != null && (
                    <View style={styles.stepExtra}>
                      <Text style={styles.stepExtraValue}>{stepData.calories}</Text>
                      <Text style={styles.stepExtraLabel}>Calories</Text>
                    </View>
                  )}
                  {stepData?.active_minutes != null && (
                    <View style={styles.stepExtra}>
                      <Text style={styles.stepExtraValue}>{stepData.active_minutes} min</Text>
                      <Text style={styles.stepExtraLabel}>Active</Text>
                    </View>
                  )}
                </View>
              ) : steps === 0 ? (
                <Text style={styles.noData}>No step data for this day</Text>
              ) : null}
            </View>

            {/* Completed Habits */}
            {completed.length > 0 && (
              <View style={styles.sheetSection}>
                <View style={styles.sheetSectionHeader}>
                  <Text style={styles.sheetSectionIcon}>✅</Text>
                  <Text style={[styles.sheetSectionTitle, { color: COLORS.success }]}>
                    Completed
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: COLORS.success + '25' }]}>
                    <Text style={[styles.countBadgeText, { color: COLORS.success }]}>{completed.length}</Text>
                  </View>
                </View>
                {completed.map((h) => (
                  <View key={h.id} style={styles.habitRow}>
                    <View style={[styles.habitColorBar, { backgroundColor: h.color }]} />
                    <View style={[styles.habitIconCircle, { backgroundColor: h.color + '20' }]}>
                      <Text style={styles.habitIcon}>{resolveIcon(h.icon)}</Text>
                    </View>
                    <Text style={styles.habitTitle}>{h.title}</Text>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  </View>
                ))}
              </View>
            )}

            {/* Incomplete Habits */}
            {incomplete.length > 0 && (
              <View style={styles.sheetSection}>
                <View style={styles.sheetSectionHeader}>
                  <Text style={styles.sheetSectionIcon}>⏳</Text>
                  <Text style={[styles.sheetSectionTitle, { color: COLORS.textSecondary }]}>
                    Not Completed
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: COLORS.surface }]}>
                    <Text style={[styles.countBadgeText, { color: COLORS.textMuted }]}>{incomplete.length}</Text>
                  </View>
                </View>
                {incomplete.map((h) => (
                  <View key={h.id} style={[styles.habitRow, styles.habitRowIncomplete]}>
                    <View style={[styles.habitColorBar,
                      { backgroundColor: h.goalReached ? COLORS.success + '60' : COLORS.textMuted + '40' }
                    ]} />
                    <View style={[styles.habitIconCircle, { backgroundColor: COLORS.surface }]}>
                      <Text style={[styles.habitIcon, { opacity: h.goalReached ? 1 : 0.5 }]}>
                        {resolveIcon(h.icon)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.habitTitle, { color: h.goalReached ? COLORS.textSecondary : COLORS.textMuted }]}>
                        {h.title}
                      </Text>
                      {h.goalReached && (
                        <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.success }}>
                          Goal reached this month
                        </Text>
                      )}
                    </View>
                    {h.goalReached
                      ? <Text style={{ fontSize: 16 }}>🎯</Text>
                      : <Ionicons name="ellipse-outline" size={20} color={COLORS.textMuted} />}
                  </View>
                ))}
              </View>
            )}

            {/* No habits state */}
            {dayDetail && dayDetail.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No habits tracked yet</Text>
              </View>
            )}

          </ScrollView>
        </Animated.View>
      </Modal>
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

  // ── Bottom Sheet ────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.cardBorder,
    paddingTop: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted + '60',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  sheetDate: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold },
  sheetSubtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetScroll: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 40 },

  sheetSection: {
    marginBottom: SPACING.xl,
  },
  sheetSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sheetSectionIcon: { fontSize: 16 },
  sheetSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    flex: 1,
  },
  sheetSectionBadge: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
  countBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countBadgeText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.bold },

  // Steps
  stepTrack: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  stepFill: { height: '100%', borderRadius: 4 },
  stepExtras: { flexDirection: 'row', gap: SPACING.xl },
  stepExtra: { alignItems: 'center' },
  stepExtraValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  stepExtraLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, marginTop: 2 },
  noData: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, fontStyle: 'italic' },

  // Habit rows
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  habitRowIncomplete: { opacity: 0.65 },
  habitColorBar: { width: 3, height: 22, borderRadius: 2 },
  habitIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitIcon: { fontSize: 16 },
  habitTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.md },
});
