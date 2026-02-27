import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBadges } from '@/hooks/useBadges';
import { BadgeCard } from '@/components/badges/BadgeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

type Filter = 'all' | 'earned' | 'locked';

export default function BadgesScreen() {
  const { badges, earnedBadges, unearnedBadges, isLoading } = useBadges();
  const [filter, setFilter] = useState<Filter>('all');

  if (isLoading) return <LoadingSpinner />;

  const displayed = filter === 'earned' ? earnedBadges : filter === 'locked' ? unearnedBadges : badges;

  const FilterBtn: React.FC<{ label: string; value: Filter }> = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === value && styles.filterActive]}
      onPress={() => setFilter(value)}
      accessibilityLabel={`Filter ${label}`}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Badges</Text>
        <Text style={styles.count}>{earnedBadges.length}/{badges.length} earned</Text>
      </View>

      {/* Filter row */}
      <View style={styles.filterRow}>
        <FilterBtn label="All" value="all" />
        <FilterBtn label="Earned" value="earned" />
        <FilterBtn label="Locked" value="locked" />
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => <BadgeCard badge={item} />}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: SPACING.xl,
  },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  count: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
  },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium },
  filterTextActive: { color: COLORS.textPrimary },
  grid: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
});
