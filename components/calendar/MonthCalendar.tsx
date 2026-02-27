import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { getDaysInMonth, formatDate } from '@/utils/dateHelpers';

interface MonthCalendarProps {
  year: number;
  month: number; // 1-12
  completedDates: string[];
  habitColors: Record<string, string>; // date -> color
  onDayPress?: (date: string) => void;
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  year,
  month,
  completedDates,
  habitColors,
  onDayPress,
}) => {
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const todayStr = formatDate(new Date());
  const completedSet = new Set(completedDates);

  const cells: (string | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.header}>
        {DAY_HEADERS.map((d, i) => (
          <Text key={i} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={i} style={styles.cell} />;
          const isToday = date === todayStr;
          const isCompleted = completedSet.has(date);
          const dotColor = habitColors[date] ?? COLORS.primary;
          const dayNum = parseInt(date.split('-')[2]);

          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.cell,
                isToday && { borderColor: COLORS.primary, borderWidth: 1.5, borderRadius: RADIUS.sm },
              ]}
              onPress={() => onDayPress?.(date)}
              accessibilityLabel={`${date}${isCompleted ? ', completed' : ''}${isToday ? ', today' : ''}`}
            >
              <Text style={[styles.dayNum, isToday && { color: COLORS.primary, fontWeight: TYPOGRAPHY.bold }]}>
                {dayNum}
              </Text>
              {isCompleted && (
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  dayHeader: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    width: 36,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayNum: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
});
