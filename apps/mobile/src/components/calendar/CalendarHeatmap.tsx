/**
 * Calendar Heatmap Component
 * GitHub-style heatmap showing habit completion intensity
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export interface HeatmapDay {
  date: string;
  completionRate: number; // 0-1 (0% - 100%)
  completedCount: number;
  totalCount: number;
}

interface CalendarHeatmapProps {
  data: HeatmapDay[];
  startDate: Date;
  endDate: Date;
  onDayPress?: (day: HeatmapDay) => void;
}

/**
 * Get intensity color based on completion rate
 */
const getIntensityColor = (rate: number): string => {
  if (rate === 0) return colors.border;
  if (rate < 0.25) return '#C6F6D5'; // Light green
  if (rate < 0.5) return '#68D391';  // Medium-light green
  if (rate < 0.75) return '#38A169'; // Medium green
  return '#22543D';                   // Dark green
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Generate all days between start and end date
 */
const generateDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export function CalendarHeatmap({ data, startDate, endDate, onDayPress }: CalendarHeatmapProps) {
  // Create a map for quick lookup
  const dataMap = new Map<string, HeatmapDay>();
  data.forEach(day => {
    dataMap.set(day.date, day);
  });

  // Generate all dates in range
  const allDates = generateDateRange(startDate, endDate);

  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDates.forEach((date, index) => {
    currentWeek.push(date);

    // Start new week on Sunday (day 0) or if it's the last date
    if (date.getDay() === 6 || index === allDates.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const renderDay = (date: Date) => {
    const dateKey = formatDate(date);
    const dayData = dataMap.get(dateKey);
    const rate = dayData?.completionRate || 0;
    const color = getIntensityColor(rate);

    const isToday = formatDate(new Date()) === dateKey;

    return (
      <TouchableOpacity
        key={dateKey}
        style={[
          styles.cell,
          { backgroundColor: color },
          isToday && styles.cellToday,
        ]}
        onPress={() => dayData && onDayPress?.(dayData)}
        activeOpacity={0.7}
      >
        {isToday && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Labels */}
      <View style={styles.monthLabels}>
        {Array.from({ length: 12 }).map((_, i) => {
          const month = new Date(startDate.getFullYear(), i, 1);
          if (month >= startDate && month <= endDate) {
            return (
              <Text key={i} style={styles.monthLabel}>
                {month.toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            );
          }
          return null;
        })}
      </View>

      {/* Heatmap Grid */}
      <View style={styles.grid}>
        {/* Weekday Labels */}
        <View style={styles.weekdayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekdayLabel}>
              {day[0]}
            </Text>
          ))}
        </View>

        {/* Weeks */}
        <View style={styles.weeksContainer}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((date) => renderDay(date))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 0.2, 0.4, 0.6, 0.8].map((rate, index) => (
          <View
            key={index}
            style={[styles.legendCell, { backgroundColor: getIntensityColor(rate) }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthLabels: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: 20, // Offset for weekday labels
  },
  monthLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
  },
  weekdayLabels: {
    marginRight: spacing.xs,
  },
  weekdayLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    height: 12,
    lineHeight: 12,
    marginBottom: 2,
  },
  weeksContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  week: {
    marginRight: 2,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: 4,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});
