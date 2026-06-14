import React from 'react';
import { ScrollView, RefreshControl, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Metric } from '@/types/advanced.types';
import { BarChart } from '@/components/analytics/BarChart';
import { LineChart } from '@/components/analytics/LineChart';
import { InsightCard } from '@/components/analytics/InsightCard';
import { resolveIcon } from '@/utils/iconHelpers';
import MetricLogger from '@/components/MetricLogger';
import { useAdvancedFeatures } from '@/hooks/useAdvancedFeatures';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function AnalyticsScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const router = useRouter();
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

  // 30-day trend line (sparse labels to avoid crowding)
  const trendData = {
    labels: data.trend.map((t, i) => (i % 6 === 0 ? t.date.slice(8, 10) : '')),
    datasets: [{ data: data.trend.map((t) => t.rate) }],
  };

  const breakdown = data.habitBreakdown;

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
  if (breakdown.length >= 2) {
    const best = breakdown[0];
    const worst = breakdown[breakdown.length - 1];
    if (best.rate >= 50) {
      insights.push({ text: `Strongest habit: ${best.title} at ${best.rate}% 💪`, type: 'positive' });
    }
    if (worst.rate < 50) {
      insights.push({ text: `${worst.title} needs love — only ${worst.rate}%. Small steps! 🌱`, type: 'warning' });
    }
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
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Last 30 days</Text>
          </View>
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => router.push('/review' as any)}
            accessibilityLabel="Open weekly review"
          >
            <Ionicons name="sparkles-outline" size={16} color={COLORS.primary} />
            <Text style={styles.reviewBtnText}>Weekly Review</Text>
          </TouchableOpacity>
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

        {/* 30-day Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>30-Day Trend</Text>
          <LineChart data={trendData} color={rateColor} />
        </View>

        {/* Per-habit breakdown */}
        {breakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Per-Habit Breakdown</Text>
            <View style={[styles.breakdownCard, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
              {breakdown.map((h, i) => (
                <View key={h.id} style={[styles.breakdownRow, i > 0 && styles.breakdownDivider]}>
                  <Text style={styles.breakdownEmoji}>{resolveIcon(h.icon)}</Text>
                  <View style={styles.breakdownMid}>
                    <Text style={[styles.breakdownTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>{h.title}</Text>
                    <View style={[styles.breakdownTrack, { backgroundColor: COLORS.surface }]}>
                      <View style={[styles.breakdownFill, { width: `${h.rate}%`, backgroundColor: h.color }]} />
                    </View>
                  </View>
                  <Text style={[styles.breakdownRate, { color: h.color }]}>{h.rate}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
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

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '18',
    borderColor: COLORS.primary + '40',
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  reviewBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
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

  breakdownCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  breakdownDivider: { borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  breakdownEmoji: { fontSize: 22, marginRight: SPACING.md },
  breakdownMid: { flex: 1 },
  breakdownTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium, marginBottom: 6 },
  breakdownTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: 3 },
  breakdownRate: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold, marginLeft: SPACING.md, width: 44, textAlign: 'right' },
});
