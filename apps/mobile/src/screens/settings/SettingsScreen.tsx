/**
 * Settings Screen
 * User profile and app preferences
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export function SettingsScreen() {
  const { user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  const {
    notificationPermission,
    requestPermissions,
    sendTestNotification
  } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(notificationPermission);
  }, [notificationPermission]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleChangePassword = () => {
    console.log('Change password');
    // TODO: Navigate to change password screen
  };

  const handleExportData = () => {
    console.log('Export data');
    // TODO: Implement export functionality
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Delete account');
            // TODO: Implement account deletion
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Notifications enabled successfully');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings'
        );
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'You will no longer receive push notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.profileMemberSince}>
            Member since {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Daily Step Goal</Text>
            <Text style={styles.settingValue}>10,000</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Reminder Time</Text>
            <Text style={styles.settingValue}>08:00 PM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Timezone</Text>
            <Text style={styles.settingValue}>UTC</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Light</Text>
          </View>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          {notificationsEnabled && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleTestNotification}
              >
                <Text style={styles.menuItemText}>Send Test Notification</Text>
                <Text style={styles.menuItemArrow}>→</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <Text style={styles.menuItemText}>Change Password</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Text style={styles.menuItemText}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
            <Text style={styles.menuItemText}>Export Data</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <Text style={[styles.menuItemText, styles.dangerText]}>
              Delete Account
            </Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileMemberSince: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  settingValue: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  menuItemArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  dangerText: {
    color: colors.error,
  },
});
