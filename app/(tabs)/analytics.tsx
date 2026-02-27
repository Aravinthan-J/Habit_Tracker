import React, { useEffect } from 'react';
import { ScrollView, RefreshControl, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
import { PdfGeneratorService } from '@/services/export/PdfGeneratorService';
import { useAuthStore } from '@/store/authStore';

export default function AnalyticsScreen() {
  const { data, isLoading } = useAnalytics();
  const { incrementAnalyticsView, premiumTheme } = useUIStore();
  const { user } = useAuthStore();

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
  const themeColors = premiumTheme?.colors || COLORS;

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
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} tintColor={themeColors.primary} />
        }
      >
        <LinearGradient
          colors={[themeColors.surface, themeColors.background]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>Analytics</Text>
              <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Last 30 days dashboard</Text>
            </View>
            <TouchableOpacity
              style={[styles.exportBtn, { borderColor: themeColors.primary + '40' }]}
              onPress={() => PdfGeneratorService.generateAnalyticsReport(data, user?.email || 'User')}
            >
              <Ionicons name="share-outline" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatsCard icon="checkmark-circle-outline" value={`${data.avgCompletionRate}%`} label="Avg Rate" color={themeColors.primary} />
          <StatsCard icon="flame-outline" value={data.bestStreak} label="Best Streak" color={themeColors.secondary} />
          <StatsCard icon="trophy-outline" value={data.totalCompletions} label="Total Done" color={COLORS.gold} />
          <StatsCard icon="list-outline" value={data.activeHabits} label="Habits" color={themeColors.accent || COLORS.accent} />
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <LineChart
            data={lineData}
            title="Completion Trend"
            color={themeColors.primary}
          />
          <BarChart
            data={weeklyRateData}
            title="Weekly Consistency"
            suffix="%"
            color={themeColors.secondary}
          />
          <BarChart
            data={weeklyStepData}
            title="Activity Summary"
            suffix="k"
            color={themeColors.accent || COLORS.accent}
          />
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Intelligent Insights</Text>
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins.text} type={ins.type} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  title: { fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  subtitle: { fontSize: TYPOGRAPHY.sm, marginTop: 2, opacity: 0.8 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
});
