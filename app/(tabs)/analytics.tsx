import React from 'react';
import { ScrollView, RefreshControl, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Metric } from '@/types/advanced.types';
import { BarChart } from '@/components/analytics/BarChart';
import { InsightCard } from '@/components/analytics/InsightCard';
import MetricLogger from '@/components/MetricLogger';
import { useAdvancedFeatures } from '@/hooks/useAdvancedFeatures';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

export default function AnalyticsScreen() {
  const { data, isLoading, refetch } = useAnalytics();
  const { metrics, logMetric } = useAdvancedFeatures();

  if (isLoading || !data) return <LoadingSpinner />;

  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const weeklyRateData = {
    labels: data.weeklyData.map((d) => {
      // Parse as local date (avoid UTC midnight timezone shift)
      const [y, mo, day] = d.date.split('-').map(Number);
      return DAY_LABELS[new Date(y, mo - 1, day).getDay()];
    }),
    datasets: [{ data: data.weeklyData.map((d) => d.rate) }],
  };

  const perfectDays = data.weeklyData.filter((d) => d.rate === 100).length;

  const rate = data.avgCompletionRate;
  const rateColor = rate >= 80 ? COLORS.success : rate >= 50 ? COLORS.primary : COLORS.accentOrange;

  const insights: Array<{ text: string; type: 'positive' | 'warning' | 'info' }> = [];
  if (rate >= 80) {
    insights.push({ text: `You're crushing it with a ${rate}% completion rate! 🔥`, type: 'positive' });
  } else if (rate < 50) {
    insights.push({ text: `Your completion rate is ${rate}%. Try setting habit reminders to improve.`, type: 'warning' });
  } else {
    insights.push({ text: `${rate}% completion rate this month — keep building that momentum!`, type: 'info' });
  }
  if (data.bestStreak >= 7) {
    insights.push({ text: `Your best streak is ${data.bestStreak} days. That's real dedication.`, type: 'positive' });
  }
  if (data.totalCompletions >= 100) {
    insights.push({ text: `${data.totalCompletions} total completions — you've built a real habit practice!`, type: 'positive' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Last 30 days</Text>
        </View>

        {/* Hero Completion Rate */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Monthly Completion</Text>
            <Text style={[styles.heroRate, { color: rateColor }]}>{rate}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${rate}%`, backgroundColor: rateColor }]} />
            </View>
          </View>
          <View style={[styles.heroIcon, { backgroundColor: rateColor + '18' }]}>
            <Ionicons name="trending-up-outline" size={32} color={rateColor} />
          </View>
        </View>

        {/* 4-stat grid */}
        <View style={styles.statGrid}>
          <StatBox icon="flame-outline" value={String(data.bestStreak)} label="Best Streak" color={COLORS.accentOrange} unit="days" />
          <StatBox icon="checkmark-circle-outline" value={String(data.totalCompletions)} label="Total Done" color={COLORS.primary} />
          <StatBox icon="list-outline" value={String(data.activeHabits)} label="Habits" color={COLORS.secondary} />
          <StatBox icon="star-outline" value={String(perfectDays)} label="Perfect Days" color={COLORS.success} unit="this week" />
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Consistency</Text>
          <BarChart
            data={weeklyRateData}
            suffix="%"
            color={COLORS.primary}
            maxValue={100}
          />
        </View>

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins.text} type={ins.type} />
            ))}
          </View>
        )}

        {/* Custom Metrics */}
        {metrics && metrics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Tracking</Text>
            {metrics.map((metric: Metric) => (
              <MetricLogger
                key={metric.id}
                metric={metric}
                onLog={(val) => logMetric.mutate({ metricId: metric.id, value: val })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, value, label, color, unit }: {
  icon: any; value: string; label: string; color: string; unit?: string;
}) {
  return (
    <View style={[styles.statBox, { borderColor: color + '30' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {unit && <Text style={styles.statUnit}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.bold },
  subtitle: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginTop: 2 },

  heroCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  heroLeft: { flex: 1 },
  heroLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  heroRate: { fontSize: 48, fontWeight: TYPOGRAPHY.extrabold, lineHeight: 52 },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginRight: SPACING.xl,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statBox: {
    width: '46%',
    margin: '2%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: { fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.bold },
  statLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.xs, marginTop: 2 },
  statUnit: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },

  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.md,
  },
});
