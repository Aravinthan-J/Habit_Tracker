/**
 * Home Screen
 * Today's habits (placeholder for now)
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, typography } from '../../constants/theme';

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Today's Habits</Text>

        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📊</Text>
          <Text style={styles.emptyTitle}>Coming Soon!</Text>
          <Text style={styles.emptyMessage}>
            Habit tracking features will be added here.
          </Text>
        </View>

        <Button
          title="Logout"
          onPress={logout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
});
