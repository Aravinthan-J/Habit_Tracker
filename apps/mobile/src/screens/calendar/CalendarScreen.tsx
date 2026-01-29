/**
 * Calendar Screen
 * Monthly view of habit completions
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useHabits } from "../../hooks/useHabits";
import { useCalendarCompletions } from "../../hooks/useCompletions";
import { LoadingSpinner } from "../../components/common";
import {
  DayDetailsModal,
  type DayDetail,
} from "../../components/calendar";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "../../constants/theme";

export function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // API expects 1-12

  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: calendarData, isLoading: calendarLoading } =
    useCalendarCompletions(year, month);

  // Convert API data to map format for easier lookup
  const completionsMap: { [key: string]: string[] } = {};
  if (calendarData?.completions) {
    calendarData.completions.forEach((completion) => {
      completionsMap[completion.date] = completion.habitIds;
    });
  }

  const habitsList = habits || [];
  const isLoading = habitsLoading || calendarLoading;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };


  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Generate calendar days
  const calendarDays = [];
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
    const dateKey = formatDateKey(yearNum, monthNum, day);
    const dayCompletions = completionsMap[dateKey] || [];

    const isToday =
      day === new Date().getDate() &&
      monthNum === new Date().getMonth() &&
      yearNum === new Date().getFullYear();

    return (
      <TouchableOpacity
        key={`day-${day}`}
        style={[styles.dayCell, isToday && styles.dayToday]}
        onPress={() => {
          // Create day detail and show modal
          const completedHabits = dayCompletions.map((habitId) => {
            const habit = habitsList.find((h) => h.id === habitId);
            return {
              id: habitId,
              title: habit?.title || "Unknown",
              icon: habit?.icon || "•",
              color: habit?.color || colors.primary,
              completedAt: new Date(dateKey).toISOString(),
            };
          });

          const pendingHabits = habitsList
            .filter((h) => !dayCompletions.includes(h.id))
            .map((habit) => ({
              id: habit.id,
              title: habit.title,
              icon: habit.icon || "•",
              color: habit.color,
            }));

          const date = new Date(dateKey);
          const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
          const completionRate = habitsList.length > 0
            ? Math.round((dayCompletions.length / habitsList.length) * 100)
            : 0;

          setSelectedDay({
            date: dateKey,
            dayOfWeek,
            completedHabits,
            skippedHabits: [],
            pendingHabits,
            totalHabits: habitsList.length,
            completionRate,
          });
          setModalVisible(true);
        }}
      >
        <Text style={[styles.dayNumber, isToday && styles.dayTodayText]}>
          {day}
        </Text>
        {dayCompletions.length > 0 && (
          <View style={styles.dotsContainer}>
            {dayCompletions.slice(0, 3).map((habitId) => {
              const habit = habitsList.find((h) => h.id === habitId);
              return (
                <View
                  key={habitId}
                  style={[
                    styles.dot,
                    { backgroundColor: habit?.color || colors.primary },
                  ]}
                />
              );
            })}
            {dayCompletions.length > 3 && (
              <Text style={styles.moreDots}>+{dayCompletions.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && !habits) {
    return <LoadingSpinner fullScreen message="Loading calendar..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Month Navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => changeMonth("prev")}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity
            onPress={() => changeMonth("next")}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => renderDay(day, index))}
        </View>

        {/* Legend */}
        {habitsList.length > 0 && (
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Habits</Text>
            {habitsList.map((habit) => (
              <View key={habit.id} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: habit.color }]}
                />
                <Text style={styles.legendText}>
                  {habit.icon} {habit.title}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Day Details Modal */}
      <DayDetailsModal
        visible={modalVisible}
        dayDetail={selectedDay}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  navButton: {
    padding: spacing.sm,
  },
  navButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
  },
  monthTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  weekdayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCell: {
    width: "14.28%", // 100% / 7 days
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xs,
  },
  dayToday: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  dayNumber: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dayTodayText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreDots: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  legend: {
    marginTop: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
});
