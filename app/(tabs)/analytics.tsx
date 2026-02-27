import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUIStore } from '@/store/uiStore';
import { StatsCard } from '@/components/analytics/StatsCard';
import { LineChart } from '@/components/analytics/LineChart';
import { BarChart } from '@/components/analytics/BarChart';
import { InsightCard } from '@/components/analytics/InsightCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { getLast30Days } from '@/utils/dateHelpers';
import { formatCompletionRateData, formatStepData } from '@/utils/chartDataFormatter';

export default function AnalyticsScreen() {
  const { data, isLoading } = useAnalytics();
  const { incrementAnalyticsView } = useUIStore();

  useEffect(() => {
    incrementAnalyticsView();
  }, []);

  if (isLoading || !data) return <LoadingSpinner />;

  const last30 = getLast30Days();
  const lineData = formatCompletionRateData(last30, data.ratesByDate);

  const weeklyLabels = data.weeklyData.map((d) => {
    const date = new Date(d.date);
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
  });
  const weeklyRateData = {
    labels: weeklyLabels,
    datasets: [{ data: data.weeklyData.map((d) => d.rate) }],
  };
  const weeklyStepData = {
    labels: weeklyLabels,
    datasets: [{ data: data.weeklyData.map((d) => Math.round(d.steps / 1000)) }],
  };

  // Generate insights
  const insights: Array<{ text: string; type: 'positive' | 'warning' | 'info' }> = [];
  if (data.avgCompletionRate >= 80) {
    insights.push({ text: `You're crushing it with a ${data.avgCompletionRate}% completion rate this month! 🔥`, type: 'positive' });
  } else if (data.avgCompletionRate < 50) {
    insights.push({ text: `Your completion rate is ${data.avgCompletionRate}%. Try setting habit reminders to improve consistency.`, type: 'warning' });
  } else {
    insights.push({ text: `${data.avgCompletionRate}% completion rate this month. Keep building that momentum!`, type: 'info' });
  }
  if (data.bestStreak >= 7) {
    insights.push({ text: `Your best streak is ${data.bestStreak} days. That's real dedication.`, type: 'positive' });
  }
  if (data.totalCompletions >= 100) {
    insights.push({ text: `${data.totalCompletions} total completions — you've built a real habit practice!`, type: 'positive' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Last 30 days</Text>
        </View>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatsCard icon="checkmark-circle-outline" value={`${data.avgCompletionRate}%`} label="Avg Rate" color={COLORS.primary} />
          <StatsCard icon="flame-outline" value={data.bestStreak} label="Best Streak" color={COLORS.secondary} />
          <StatsCard icon="trophy-outline" value={data.totalCompletions} label="Total Done" color={COLORS.gold} />
          <StatsCard icon="list-outline" value={data.activeHabits} label="Habits" color={COLORS.accent} />
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <LineChart
            data={lineData}
            title="Completion Rate Trend (%)"
          />
          <BarChart
            data={weeklyRateData}
            title="This Week — Completion Rate (%)"
            suffix="%"
          />
          <BarChart
            data={weeklyStepData}
            title="This Week — Steps (thousands)"
            suffix="k"
          />
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins.text} type={ins.type} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  subtitle: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.md,
  },
});
