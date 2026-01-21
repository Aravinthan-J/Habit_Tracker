import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { EmptyState } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';

/**
 * Calendar Screen - Placeholder for Phase 2
 * Will show monthly calendar view with habit completions
 */
const CalendarScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <EmptyState
        icon="calendar-outline"
        title="Coming Soon!"
        message="The calendar view will show your habit completions for the entire month with colored dots for each habit."
      />

      <View style={styles.featureList}>
        <Text style={styles.featureTitle}>Upcoming Features:</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Monthly calendar grid</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Colored dots for each completed habit</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Tap dates to see habit details</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Visual streak tracking</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  featureList: {
    padding: spacing.xl,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});

export default CalendarScreen;
