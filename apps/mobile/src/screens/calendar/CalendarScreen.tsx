import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';
import { colors, spacing, typography } from '../../constants/theme';
import HeatmapCalendar from '../../components/analytics/HeatmapCalendar';
import { formatDataForHeatmap } from '../../utils/chartDataUtils';

const completionApiService = apiClient.completion;

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'heatmap'

  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['monthlyCalendar', currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: () => completionApiService.getMonthlyCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1),
  });

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    if (monthlyData) {
      Object.keys(monthlyData).forEach(date => {
        const completions = monthlyData[date];
        marks[date] = {
          dots: completions.slice(0, 5).map(c => ({ key: c.habitId, color: c.habit.color })),
          // customStyles for streak highlighting can be added here
        };
      });
    }
    return marks;
  }, [monthlyData]);

  const heatmapData = useMemo(() => {
    if (!monthlyData) return [];
    const data = Object.keys(monthlyData).map(date => ({
      date,
      count: monthlyData[date].length,
    }));
    return formatDataForHeatmap(data);
  }, [monthlyData]);

  const onMonthChange = (month: any) => {
    setCurrentDate(new Date(month.dateString));
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'calendar' ? 'heatmap' : 'calendar')}>
          <Text style={styles.toggleButton}>{viewMode === 'calendar' ? 'Show Heatmap' : 'Show Calendar'}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'calendar' ? (
        <Calendar
          current={currentDate.toISOString().split('T')[0]}
          onMonthChange={onMonthChange}
          markingType={'multi-dot'}
          markedDates={markedDates}
          theme={{
            calendarBackground: colors.background,
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: '#d9e1e8',
            arrowColor: colors.primary,
            monthTextColor: colors.primary,
            indicatorColor: 'blue',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
        />
      ) : (
        <HeatmapCalendar data={heatmapData} title="Completion Heatmap" />
      )}
      
      <TouchableOpacity style={styles.todayButton} onPress={() => setCurrentDate(new Date())}>
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  toggleButton: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  todayButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  todayButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  }
});

export default CalendarScreen;
