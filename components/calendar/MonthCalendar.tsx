import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { getDaysInMonth, formatDate } from '@/utils/dateHelpers';

export interface DayData {
  colors: string[];
  allDone: boolean;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  dayData: Record<string, DayData>;
  selectedDate: string | null;
  onDayPress: (date: string) => void;
}

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  year,
  month,
  dayData,
  selectedDate,
  onDayPress,
}) => {
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const todayStr = formatDate(new Date());

  const cells: (string | null)[] = [...Array(firstDayOfWeek).fill(null), ...days];

  return (
    <View>
      <View style={styles.header}>
        {DAY_HEADERS.map((d, i) => (
          <Text key={i} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={i} style={styles.cell} />;

          const isToday = date === todayStr;
          const isSelected = date === selectedDate;
          const isFuture = date > todayStr;
          const data = dayData[date];
          const colors = data?.colors ?? [];
          const allDone = data?.allDone ?? false;
          const dayNum = parseInt(date.split('-')[2]);
          const shown = colors.slice(0, 3);
          const overflow = colors.length - shown.length;

          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.cell,
                isSelected && styles.cellSelected,
                !isSelected && isToday && styles.cellToday,
                !isSelected && allDone && styles.cellAllDone,
              ]}
              onPress={() => onDayPress(date)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayNum,
                (isToday || isSelected) && styles.dayNumHighlight,
                isFuture && styles.dayNumFuture,
              ]}>
                {dayNum}
              </Text>

              {colors.length > 0 ? (
                <View style={styles.dotsRow}>
                  {shown.map((color, di) => (
                    <View key={di} style={[styles.dot, { backgroundColor: color }]} />
                  ))}
                  {overflow > 0 && (
                    <Text style={styles.overflow}>+{overflow}</Text>
                  )}
                </View>
              ) : (
                <View style={styles.dotsRow} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  cellSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  cellAllDone: {
    backgroundColor: COLORS.success + '18',
    borderRadius: RADIUS.sm,
  },
  dayNum: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 18,
  },
  dayNumHighlight: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.bold,
  },
  dayNumFuture: {
    color: COLORS.textMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 7,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  overflow: {
    color: COLORS.textMuted,
    fontSize: 8,
    lineHeight: 7,
  },
});
