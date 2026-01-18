import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import StatsCard from '../../components/analytics/StatsCard';
import LineChart from '../../components/analytics/LineChart';
import DonutChart from '../../components/analytics/DonutChart';
import BarChart from '../../components/analytics/BarChart';
import HeatmapCalendar from '../../components/analytics/HeatmapCalendar';
import InsightCard from '../../components/analytics/InsightCard';
import { formatTrendDataForLineChart, formatCompletionDataForPieChart, formatWeeklyDataForBarChart, formatDataForHeatmap } from '../../utils/chartDataUtils';
import { useQueryClient } from '@tanstack/react-query';

const AnalyticsScreen = () => {
  const { overview, trends, insights, isLoading } = useAnalytics();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['analyticsOverview'] });
    queryClient.invalidateQueries({ queryKey: ['analyticsTrends'] });
    queryClient.invalidateQueries({ queryKey: ['analyticsInsights'] });
    setRefreshing(false);
  }, [queryClient]);

  const lineChartData = trends ? formatTrendDataForLineChart(trends) : { labels: [], datasets: [] };
  
  const totalCompletions = overview?.totalCompletionsThisMonth ?? 0;
  // This is a placeholder for missed completions, a real implementation would need more data.
  const missedCompletions = 100 - totalCompletions; 
  const pieChartData = formatCompletionDataForPieChart(totalCompletions, missedCompletions);

  // Placeholder data for weekly bar chart
  const weeklyData = [
    { week: 'Week 1', completions: 30 },
    { week: 'Week 2', completions: 45 },
    { week: 'Week 3', completions: 28 },
    { week: 'Week 4', completions: 80 },
  ];
  const barChartData = formatWeeklyDataForBarChart(weeklyData);

  // Placeholder data for heatmap
  const heatmapData = [
    { date: '2026-01-01', count: 1 },
    { date: '2026-01-02', count: 2 },
    { date: '2026-01-03', count: 3 },
  ];
  const formattedHeatmapData = formatDataForHeatmap(heatmapData);


  if (isLoading && !refreshing) {
    return <View style={styles.centered}><Text>Loading analytics...</Text></View>;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Analytics Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <StatsCard label="Active Habits" value={overview?.totalActiveHabits.toString() ?? '0'} iconName="list-outline" />
        <StatsCard label="Completions (Month)" value={overview?.totalCompletionsThisMonth.toString() ?? '0'} iconName="checkmark-done-outline" percentageChange={overview?.monthlyCompletionChange}/>
        <StatsCard label="Active Streaks" value={overview?.activeStreaks.toString() ?? '0'} iconName="flame-outline" />
        <StatsCard label="Avg Completion" value={`${overview?.averageCompletionRate.toFixed(0) ?? 0}%`} iconName="speedometer-outline" />
      </View>
      
      <LineChart data={lineChartData} title="Daily Consistency (Last 30 Days)" />
      
      <DonutChart data={pieChartData} title="Overall Completion" />
      
      <BarChart data={barChartData} title="Weekly Comparison" />
      
      <HeatmapCalendar data={formattedHeatmapData} title="Completion Heatmap" />

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsHeader}>Insights</Text>
        {insights?.map(insight => (
          <InsightCard key={insight.id} message={insight.message} type={insight.type} />
        )) ?? <Text>No insights available.</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  insightsContainer: {
    padding: 20,
  },
  insightsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
});

export default AnalyticsScreen;
