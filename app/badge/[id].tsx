import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBadges } from '@/hooks/useBadges';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { TIER_COLORS } from '@/constants/badges';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';

export default function BadgeDetailScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { badges, isLoading } = useBadges();

  if (isLoading) return <LoadingSpinner />;
  const badge = badges.find((b) => b.id === id);
  if (!badge) return null;

  const tierColor = TIER_COLORS[badge.tier];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[COLORS.surface, COLORS.card]}
          style={styles.card}
        >
          <View style={[styles.iconRing, { borderColor: tierColor }]}>
            <Text style={styles.emoji}>🏆</Text>
          </View>

          <View style={[styles.tierChip, { backgroundColor: tierColor + '33' }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>
              {badge.tier.toUpperCase()} • {badge.type.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{badge.name}</Text>
          <Text style={styles.description}>{badge.description}</Text>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <Ionicons
              name={badge.earned ? 'checkmark-circle' : 'lock-closed-outline'}
              size={20}
              color={badge.earned ? COLORS.success : COLORS.textMuted}
            />
            <Text style={[styles.statusText, { color: badge.earned ? COLORS.success : COLORS.textMuted }]}>
              {badge.earned
                ? `Earned on ${new Date(badge.earned_at!).toLocaleDateString()}`
                : 'Not yet earned'}
            </Text>
          </View>

          <View style={styles.requirements}>
            <Text style={styles.reqTitle}>How to earn</Text>
            <Text style={styles.reqText}>{badge.description}</Text>
            {badge.requirement > 1 && (
              <Text style={styles.reqValue}>Target: {badge.requirement.toLocaleString()}</Text>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, paddingBottom: 0 },
  content: { padding: SPACING.xl },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emoji: { fontSize: 52 },
  tierChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  tierText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.bold, letterSpacing: 0.8 },
  name: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    width: '100%',
    marginVertical: SPACING.xl,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  statusText: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.medium },
  requirements: { width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg },
  reqTitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium, marginBottom: SPACING.sm },
  reqText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, lineHeight: 22 },
  reqValue: { color: COLORS.primary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, marginTop: SPACING.sm },
});
