import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { PREMIUM_THEMES } from '@/constants/Themes';
import { HABIT_TEMPLATES } from '@/constants/templates';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useAuthStore();
  const { theme, setTheme, premiumTheme } = useUIStore();
  const colors = premiumTheme?.colors || COLORS;
  const { requestAndScheduleDaily, cancelAll } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const success = await requestAndScheduleDaily(reminderTime);
      if (!success) {
        setNotificationsEnabled(false);
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
      }
    } else {
      await cancelAll();
    }
  };

  const SettingsRow: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    color?: string;
  }> = ({ icon, label, value, onPress, right, color = COLORS.textPrimary }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.cardBorder || COLORS.cardBorder }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={color} style={styles.rowIcon} />
        <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      </View>
      {right ?? (
        <View style={styles.rowRight}>
          {value && <Text style={[styles.rowValue, { color: colors.textMuted }]}>{value}</Text>}
          {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        {/* Profile */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
            <View>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.displayName ?? 'Habity User'}</Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Themes */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Premium Themes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
          <TouchableOpacity
            style={[styles.themeBadge, theme === 'dark' && styles.themeBadgeActive, { backgroundColor: COLORS.surface }]}
            onPress={() => setTheme('dark')}
          >
            <Text style={[styles.themeText, { color: COLORS.textPrimary }]}>Default</Text>
          </TouchableOpacity>
          {Object.values(PREMIUM_THEMES).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.themeBadge, theme === t.id && styles.themeBadgeActive, { backgroundColor: t.colors.surface }]}
              onPress={() => setTheme(t.id as any)}
            >
              <Text style={[styles.themeText, { color: t.colors.textPrimary }]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habit Templates */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Habit Templates</Text>
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          {HABIT_TEMPLATES.map((template, idx) => (
            <SettingsRow
              key={idx}
              icon={template.icon as any}
              label={template.title}
              color={template.color}
              onPress={() => Alert.alert('Add Habit', `Would you like to add "${template.title}" to your habits?`)}
            />
          ))}
        </Card>

        {/* Focus Mode */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Productivity</Text>
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="timer-outline"
            label="Focus Mode"
            onPress={() => { }} // Navigate to focus screen
            color={colors.primary}
          />
        </Card>

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="notifications-outline"
            label="Daily Reminder"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.surface, true: colors.primary + '88' }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
                accessibilityLabel="Toggle daily reminder"
              />
            }
          />
          {notificationsEnabled && (
            <SettingsRow
              icon="time-outline"
              label="Reminder Time"
              value={reminderTime}
            />
          )}
        </Card>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About</Text>
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <SettingsRow icon="document-text-outline" label="Privacy Policy" onPress={() => { }} />
          <SettingsRow icon="help-circle-outline" label="Help & Support" onPress={() => { }} />
        </Card>

        {/* Sign Out */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            color={COLORS.error}
          />
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xxxl, fontWeight: TYPOGRAPHY.bold },
  section: { marginHorizontal: SPACING.xl, marginBottom: SPACING.md },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
  },
  profileName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  profileEmail: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { marginRight: SPACING.md },
  rowLabel: { fontSize: TYPOGRAPHY.md },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  rowValue: { fontSize: TYPOGRAPHY.sm },
  themeScroll: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg, flexDirection: 'row' },
  themeBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, marginRight: SPACING.sm, borderWidth: 2, borderColor: 'transparent' },
  themeBadgeActive: { borderColor: '#FFFFFF' },
  themeText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold },
});
