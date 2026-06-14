import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { useAuthStore } from '@/store/authStore';
import { computeWeeklyReview, StreakChange } from '@/utils/weeklyReview';
import { shareWeeklyReviewCard } from '@/services/export/WeeklyReviewCardService';
import { EmptyState } from '@/components/shared/EmptyState';
import { resolveIcon } from '@/utils/iconHelpers';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function WeeklyReviewScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const router = useRouter();
  const { habits } = useHabits();
  const { completions } = useCompletions();
  const { user } = useAuthStore();
  const [sharing, setSharing] = useState(false);

  const stats = useMemo(() => computeWeeklyReview(habits, completions), [habits, completions]);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareWeeklyReviewCard(stats, user?.displayName?.split(' ')[0] ?? 'My');
    } finally {
      setSharing(false);
    }
  };

  const rateColor =
    stats.completionRate >= 80 ? COLORS.success
    : stats.completionRate >= 50 ? COLORS.primary
    : COLORS.accentOrange;
  const deltaUp = stats.delta >= 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close weekly review">
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Review</Text>
        <TouchableOpacity onPress={handleShare} disabled={sharing || habits.length === 0} accessibilityLabel="Share weekly review">
          <Ionicons name="share-outline" size={24} color={sharing ? COLORS.textMuted : COLORS.primary} />
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          icon="bar-chart-outline"
          title="Nothing to review yet"
          subtitle="Create a few habits and check back at the end of the week!"
        />
      ) : (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.range}>{stats.rangeLabel}</Text>

          {/* Hero */}
          <LinearGradient colors={[COLORS.card, COLORS.surface] as const} style={styles.hero}>
            <Text style={[styles.heroRate, { color: rateColor }]}>{stats.completionRate}%</Text>
            <Text style={styles.heroLabel}>completion this week</Text>
            <View style={[styles.deltaPill, { backgroundColor: (deltaUp ? COLORS.success : COLORS.secondary) + '22' }]}>
              <Ionicons
                name={deltaUp ? 'trending-up-outline' : 'trending-down-outline'}
                size={14}
                color={deltaUp ? COLORS.success : COLORS.secondary}
              />
              <Text style={[styles.deltaText, { color: deltaUp ? COLORS.success : COLORS.secondary }]}>
                {stats.delta === 0 ? 'Same as last week' : `${Math.abs(stats.delta)}% ${deltaUp ? 'up' : 'down'} vs last week`}
              </Text>
            </View>
          </LinearGradient>

          {/* Stat row */}
          <View style={styles.statRow}>
            <StatPill value={String(stats.totalCompletions)} label="Completions" color={COLORS.primary} />
            <StatPill value={String(stats.perfectDays)} label="Perfect days" color={COLORS.success} />
            <StatPill value={String(stats.topStreaks[0]?.streak ?? 0)} label="Top streak" color={COLORS.accentOrange} />
          </View>

          {/* Best / worst habit */}
          {stats.bestHabit && (
            <HighlightCard
              emoji="🏆"
              title="Best habit"
              subtitle={`${stats.bestHabit.title} — ${stats.bestHabit.count}/7 days`}
              color={stats.bestHabit.color}
            />
          )}
          {stats.worstHabit && (
            <HighlightCard
              emoji="🌱"
              title="Needs some love"
              subtitle={`${stats.worstHabit.title} — only ${stats.worstHabit.count}/7 days`}
              color={COLORS.accentOrange}
            />
          )}

          {/* Streak changes */}
          {stats.newStreaks.length > 0 && (
            <StreakSection title="🔥 New streaks this week" items={stats.newStreaks} suffix="day streak" />
          )}
          {stats.lostStreaks.length > 0 && (
            <StreakSection title="💔 Streaks lost" items={stats.lostStreaks} suffix="day streak broken" />
          )}
          {stats.topStreaks.length > 0 && (
            <StreakSection title="⚡ Current streaks" items={stats.topStreaks} suffix="days and counting" />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
    <View style={[styles.statPill, { borderColor: color + '30' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HighlightCard({ emoji, title, subtitle, color }: {
  emoji: string; title: string; subtitle: string; color: string;
}) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
    <View style={[styles.highlight, { borderColor: color + '40', backgroundColor: color + '12' }]}>
      <Text style={styles.highlightEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.highlightTitle}>{title}</Text>
        <Text style={styles.highlightSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function StreakSection({ title, items, suffix }: { title: string; items: StreakChange[]; suffix: string }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((s, i) => (
          <View key={s.id} style={[styles.streakRow, i > 0 && styles.streakDivider]}>
            <Text style={styles.streakEmoji}>{resolveIcon(s.icon)}</Text>
            <Text style={styles.streakTitle} numberOfLines={1}>{s.title}</Text>
            <Text style={[styles.streakCount, { color: s.color }]}>{s.streak} {suffix}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.semibold },
  body: { flex: 1, paddingHorizontal: SPACING.xl },
  range: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginBottom: SPACING.md, textAlign: 'center' },

  hero: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  heroRate: { fontSize: 56, fontWeight: TYPOGRAPHY.extrabold, lineHeight: 60 },
  heroLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  deltaText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },

  statRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: { fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.bold },
  statLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.xs, marginTop: 2 },

  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  highlightEmoji: { fontSize: 26 },
  highlightTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  highlightSubtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, marginTop: 2 },

  section: { marginTop: SPACING.md, marginBottom: SPACING.sm },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.lg,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  streakDivider: { borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  streakEmoji: { fontSize: 18, marginRight: SPACING.md },
  streakTitle: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium },
  streakCount: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.bold, marginLeft: SPACING.md },
});
