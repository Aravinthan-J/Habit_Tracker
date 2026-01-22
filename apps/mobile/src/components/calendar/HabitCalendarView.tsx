/**
 * Habit Calendar View Component
 * Shows a calendar view for a specific habit
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export interface DayStatus {
  date: string;
  completed: boolean;
  skipped?: boolean;
}

interface HabitCalendarViewProps {
  habitColor: string;
  habitIcon: string;
  habitTitle: string;
  data: DayStatus[];
  currentMonth: Date;
  onDayPress?: (date: string) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Get days in month and starting day of week
 */
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  return { daysInMonth, startingDayOfWeek };
};

export function HabitCalendarView({
  habitColor,
  habitIcon,
  habitTitle,
  data,
  currentMonth,
  onDayPress,
  onMonthChange,
}: HabitCalendarViewProps) {
  // Create a map for quick lookup
  const dataMap = new Map<string, DayStatus>();
  data.forEach(day => {
    dataMap.set(day.date, day);
  });

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const yearNum = currentMonth.getFullYear();
    const monthNum = currentMonth.getMonth();
    const dateKey = formatDate(yearNum, monthNum, day);
    const dayStatus = dataMap.get(dateKey);

    const isToday =
      day === new Date().getDate() &&
      monthNum === new Date().getMonth() &&
      yearNum === new Date().getFullYear();

    const isFuture = new Date(dateKey) > new Date();

    return (
      <TouchableOpacity
        key={`day-${day}`}
        style={[
          styles.dayCell,
          isToday && styles.dayToday,
        ]}
        onPress={() => !isFuture && onDayPress?.(dateKey)}
        disabled={isFuture}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.dayTodayText,
          isFuture && styles.dayFutureText,
        ]}>
          {day}
        </Text>

        {/* Completion Status */}
        {!isFuture && (
          <View style={styles.statusContainer}>
            {dayStatus?.completed && (
              <View
                style={[
                  styles.completedCircle,
                  { backgroundColor: habitColor },
                ]}
              >
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
            {dayStatus?.skipped && (
              <View style={styles.skippedCircle}>
                <Text style={styles.skipMark}>−</Text>
              </View>
            )}
            {!dayStatus?.completed && !dayStatus?.skipped && (
              <View style={styles.emptyCircle} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Calculate statistics
  const completedDays = data.filter(d => d.completed).length;
  const skippedDays = data.filter(d => d.skipped).length;
  const totalDays = daysInMonth;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitIcon}>{habitIcon}</Text>
          <Text style={styles.habitTitle}>{habitTitle}</Text>
        </View>
        <View style={[styles.colorIndicator, { backgroundColor: habitColor }]} />
      </View>

      {/* Month Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={() => onMonthChange?.('prev')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <TouchableOpacity
          onPress={() => onMonthChange?.('next')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: habitColor }]}>{completedDays}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{skippedDays}</Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => renderDay(day, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  habitIcon: {
    fontSize: typography.fontSize.xl,
  },
  habitTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  navButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
  },
  monthTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekdayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  dayToday: {
    backgroundColor: colors.primaryLight + '40',
    borderRadius: borderRadius.sm,
  },
  dayNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dayTodayText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  dayFutureText: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  skippedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textSecondary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipMark: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
