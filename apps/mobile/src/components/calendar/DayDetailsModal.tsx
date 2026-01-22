/**
 * Day Details Modal Component
 * Shows detailed information for a selected calendar day
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export interface DayDetail {
  date: string;
  dayOfWeek: string;
  completedHabits: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
    completedAt: string;
  }>;
  skippedHabits: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
  }>;
  pendingHabits: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
  }>;
  totalHabits: number;
  completionRate: number;
}

interface DayDetailsModalProps {
  visible: boolean;
  dayDetail: DayDetail | null;
  onClose: () => void;
}

/**
 * Format date for display
 */
const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time for display
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function DayDetailsModal({ visible, dayDetail, onClose }: DayDetailsModalProps) {
  if (!dayDetail) return null;

  const {
    date,
    completedHabits,
    skippedHabits,
    pendingHabits,
    totalHabits,
    completionRate,
  } = dayDetail;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>{formatDisplayDate(date)}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={[
                  styles.summaryValue,
                  { color: completionRate >= 80 ? colors.success : colors.primary }
                ]}>
                  {completionRate}%
                </Text>
                <Text style={styles.summaryLabel}>Completion Rate</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {completedHabits.length}/{totalHabits}
                </Text>
                <Text style={styles.summaryLabel}>Habits Completed</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Completed Habits */}
            {completedHabits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>✓ Completed</Text>
                  <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.success }]}>
                      {completedHabits.length}
                    </Text>
                  </View>
                </View>
                {completedHabits.map((habit) => (
                  <View key={habit.id} style={styles.habitItem}>
                    <View style={styles.habitLeft}>
                      <Text style={styles.habitIcon}>{habit.icon}</Text>
                      <View>
                        <Text style={styles.habitTitle}>{habit.title}</Text>
                        <Text style={styles.habitTime}>
                          Completed at {formatTime(habit.completedAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.habitIndicator, { backgroundColor: habit.color }]} />
                  </View>
                ))}
              </View>
            )}

            {/* Skipped Habits */}
            {skippedHabits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>− Skipped</Text>
                  <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.warning }]}>
                      {skippedHabits.length}
                    </Text>
                  </View>
                </View>
                {skippedHabits.map((habit) => (
                  <View key={habit.id} style={styles.habitItem}>
                    <View style={styles.habitLeft}>
                      <Text style={styles.habitIcon}>{habit.icon}</Text>
                      <Text style={styles.habitTitle}>{habit.title}</Text>
                    </View>
                    <View style={[styles.habitIndicator, { backgroundColor: colors.warning }]} />
                  </View>
                ))}
              </View>
            )}

            {/* Pending Habits */}
            {pendingHabits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>○ Not Completed</Text>
                  <View style={[styles.badge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                      {pendingHabits.length}
                    </Text>
                  </View>
                </View>
                {pendingHabits.map((habit) => (
                  <View key={habit.id} style={styles.habitItem}>
                    <View style={styles.habitLeft}>
                      <Text style={styles.habitIcon}>{habit.icon}</Text>
                      <Text style={styles.habitTitle}>{habit.title}</Text>
                    </View>
                    <View style={[styles.habitIndicatorEmpty]} />
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {completedHabits.length === 0 && skippedHabits.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📅</Text>
                <Text style={styles.emptyStateText}>No habits completed on this day</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  habitIcon: {
    fontSize: typography.fontSize.xl,
  },
  habitTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  habitTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  habitIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  habitIndicatorEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
