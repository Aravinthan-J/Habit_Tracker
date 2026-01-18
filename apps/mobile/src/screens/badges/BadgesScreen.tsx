import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useBadges } from '../../hooks/useBadges';
import BadgeGrid from '../../components/badges/BadgeGrid';
import BadgeUnlockModal from '../../components/badges/BadgeUnlockModal';
import { useBadgeStore } from '../../store/badgeStore';
import { colors, spacing, typography } from '../../constants/theme';
import { BadgeDefinition } from '../../constants/badges';

const BadgesScreen = () => {
  const { allBadges, earnedBadgesSet, badgeProgress, isLoading } = useBadges();
  const { unlockedBadge, isUnlockModalVisible, hideUnlockModal } = useBadgeStore();

  const handleBadgePress = (badge: BadgeDefinition) => {
    // In a real app, you might navigate to a detail screen
    console.log('Badge pressed:', badge.name);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading badges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Badge Collection</Text>
      <Text style={styles.subtitle}>{`You've earned ${earnedBadgesSet.size} of ${allBadges.length} badges`}</Text>
      
      <BadgeGrid
        badges={allBadges}
        earnedBadges={earnedBadgesSet}
        badgeProgress={badgeProgress}
        onBadgePress={handleBadgePress}
      />
      
      <BadgeUnlockModal
        badge={unlockedBadge}
        visible={isUnlockModalVisible}
        onClose={hideUnlockModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});

export default BadgesScreen;
