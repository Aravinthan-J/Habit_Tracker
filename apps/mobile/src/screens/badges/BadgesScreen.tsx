/**
 * Badges Screen
 * Display all badges with earned and locked states
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useBadges } from '../../hooks/useBadges';
import { BadgeCard } from '../../components/badges/BadgeCard';
import { BadgeUnlockModal } from '../../components/badges/BadgeUnlockModal';
import { ConfettiAnimation } from '../../components/celebrations/ConfettiAnimation';
import { LoadingSpinner } from '../../components/common';
import { BADGE_CATEGORIES } from '../../constants/badges';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import type { Badge, UserBadge, BadgeProgress } from '@habit-tracker/api-client';

export function BadgesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const {
    allBadges,
    earnedBadges,
    progress,
    isLoading,
    refetch,
    showUnlockModal,
    unlockedBadge,
    unlockMessage,
    hideUnlockModal,
  } = useBadges();

  // Filter badges by category
  const filteredBadges = selectedCategory === 'all'
    ? allBadges
    : allBadges.filter((b: Badge) => b.type === selectedCategory);

  // Combine earned and unearned badges with progress
  const badgesWithStatus = filteredBadges.map((badge: Badge) => {
    const earned = earnedBadges.find((eb: UserBadge) => eb.badgeId === badge.id);
    const prog = progress.find((p: BadgeProgress) => p.badge.id === badge.id);

    return {
      ...badge,
      isEarned: !!earned,
      earnedAt: earned?.earnedAt,
      progress: prog ? {
        current: prog.current,
        required: prog.required,
        percentage: prog.percentage,
      } : null,
    };
  });

  const handleBadgePress = (badge: any) => {
    // TODO: Navigate to badge detail screen
    console.log('Badge pressed:', badge.name);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading badges..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Badge Collection</Text>
        <Text style={styles.subtitle}>
          {earnedBadges.length}/{allBadges.length} badges earned
        </Text>
      </View>

      {/* Category Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {BADGE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              selectedCategory === category.id && styles.tabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.tabIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.tabText,
                selectedCategory === category.id && styles.tabTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Badge Grid */}
      <FlatList
        data={badgesWithStatus}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BadgeCard badge={item} onPress={() => handleBadgePress(item)} />
        )}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      />

      {/* Badge Unlock Modal */}
      <ConfettiAnimation visible={showUnlockModal} duration={3000} />
      <BadgeUnlockModal
        visible={showUnlockModal}
        badge={unlockedBadge}
        message={unlockMessage}
        onClose={hideUnlockModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  tabs: {
    maxHeight: 60,
    marginBottom: spacing.md,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.xs,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  tabTextActive: {
    color: colors.white,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
