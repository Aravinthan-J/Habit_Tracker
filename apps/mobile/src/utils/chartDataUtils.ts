import { TrendDataPoint } from '../services/analytics/AnalyticsService';
import { ChartData } from 'react-native-chart-kit/dist/HelperTypes';

/**
 * Formats trend data for the LineChart component.
 */
export const formatTrendDataForLineChart = (trends: TrendDataPoint[]): ChartData => {
  const labels = trends.map(point => point.date.split('-')[2]); // Just the day
  const data = trends.map(point => point.completionPercentage);

  return {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`, // Main theme color
        strokeWidth: 2,
      },
    ],
    legend: ['Completion Rate (%)'],
  };
};

/**
 * Formats completion data for a PieChart (Donut style).
 */
export const formatCompletionDataForPieChart = (completed: number, missed: number) => {
  return [
    { name: 'Completed', count: completed, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Missed', count: missed, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];
};

/**
 * Formats weekly comparison data for a BarChart.
 */
export const formatWeeklyDataForBarChart = (weeklyData: { week: string; completions: number }[]): ChartData => {
  const labels = weeklyData.map(d => d.week);
  const data = weeklyData.map(d => d.completions);

  return {
    labels,
    datasets: [
      {
        data,
      },
    ],
  };
};

/**
 * Generates data for a heatmap calendar.
 * Expects an array of objects with date and completion count.
 */
export const formatDataForHeatmap = (data: { date: string; count: number }[]) => {
  return data.map(item => ({
    date: item.date,
    count: item.count,
  }));
};
