import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useHabits } from '@/hooks/useHabits';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { HABIT_TEMPLATES, HabitTemplate } from '@/constants/templates';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useAuthStore();
  const { habits, createHabit } = useHabits();
  const { requestAndScheduleDaily, cancelAll } = useNotifications();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempHour, setTempHour] = useState(20);
  const [tempMinute, setTempMinute] = useState(0);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  // ── Notifications ─────────────────────────────────────────────────────────
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

  // ── Time picker ───────────────────────────────────────────────────────────
  const openTimePicker = () => {
    const [h, m] = reminderTime.split(':').map(Number);
    setTempHour(h);
    setTempMinute(m);
    setTimePickerVisible(true);
  };

  const confirmTime = async () => {
    const newTime = `${String(tempHour).padStart(2, '0')}:${String(tempMinute).padStart(2, '0')}`;
    setReminderTime(newTime);
    setTimePickerVisible(false);
    if (notificationsEnabled) {
      await requestAndScheduleDaily(newTime);
    }
  };

  const adjustHour = (delta: number) =>
    setTempHour((h) => (h + delta + 24) % 24);
  const adjustMinute = (delta: number) =>
    setTempMinute((m) => (m + delta + 60) % 60);

  // ── Habit templates ───────────────────────────────────────────────────────
  const handleAddTemplate = (template: HabitTemplate) => {
    const alreadyExists = habits.some(
      (h) => h.title.toLowerCase() === template.title.toLowerCase()
    );
    if (alreadyExists) {
      Alert.alert('Already Added', `"${template.title}" is already in your habits.`);
      return;
    }
    Alert.alert(
      'Add Habit',
      `Add "${template.title}" to your habits?\n\n${template.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              await createHabit.mutateAsync({
                title: template.title,
                icon: template.icon,
                color: template.color,
                monthly_goal: template.monthly_goal,
              });
              Alert.alert('Added!', `"${template.title}" is now in your habits.`);
            } catch (e: any) {
              // mutateAsync throws 'Saved locally.' message when offline — that's fine
              if (!e.message?.includes('locally')) {
                Alert.alert('Error', e.message || 'Could not add habit.');
              }
            }
          },
        },
      ]
    );
  };

  // ── Reusable row ──────────────────────────────────────────────────────────
  const SettingsRow: React.FC<{
    icon?: keyof typeof Ionicons.glyphMap;
    emojiIcon?: string;
    label: string;
    value?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    color?: string;
  }> = ({ icon, emojiIcon, label, value, onPress, right, color = COLORS.textPrimary }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        {emojiIcon ? (
          <Text style={[styles.rowIcon, { fontSize: 20 }]}>{emojiIcon}</Text>
        ) : icon ? (
          <Ionicons name={icon} size={20} color={color} style={styles.rowIcon} />
        ) : null}
        <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      </View>
      {right ?? (
        <View style={styles.rowRight}>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
        </View>
      )}
    </TouchableOpacity>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile */}
        <Card style={styles.section}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user?.displayName ?? 'Habity User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Habit Templates */}
        <Text style={styles.sectionTitle}>Habit Templates</Text>
        <Card style={styles.section}>
          {HABIT_TEMPLATES.map((template, idx) => {
            const added = habits.some(
              (h) => h.title.toLowerCase() === template.title.toLowerCase()
            );
            return (
              <SettingsRow
                key={idx}
                emojiIcon={template.icon}
                label={template.title}
                color={added ? COLORS.textMuted : template.color}
                right={
                  <View style={styles.rowRight}>
                    {added ? (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={20} color={template.color} />
                    )}
                  </View>
                }
                onPress={() => handleAddTemplate(template)}
              />
            );
          })}
        </Card>

        {/* Productivity */}
        <Text style={styles.sectionTitle}>Productivity</Text>
        <Card style={styles.section}>
          <SettingsRow
            icon="timer-outline"
            label="Focus Mode"
            onPress={() => router.push('/focus')}
            color={COLORS.primary}
          />
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.section}>
          <SettingsRow
            icon="notifications-outline"
            label="Daily Reminder"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: COLORS.surface, true: COLORS.primary + '88' }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textMuted}
                accessibilityLabel="Toggle daily reminder"
              />
            }
          />
          {notificationsEnabled && (
            <SettingsRow
              icon="time-outline"
              label="Reminder Time"
              value={reminderTime}
              onPress={openTimePicker}
            />
          )}
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.section}>
          <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <SettingsRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://habity.app/privacy')}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Linking.openURL('mailto:support@habity.app')}
          />
        </Card>

        {/* Sign Out */}
        <Card style={styles.section}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            color={COLORS.error}
          />
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={timePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Reminder Time</Text>

            <View style={styles.timePicker}>
              {/* Hour */}
              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={() => adjustHour(1)} style={styles.timeBtn}>
                  <Ionicons name="chevron-up" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(tempHour).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.timeBtn}>
                  <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.timeSep}>:</Text>

              {/* Minute */}
              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={() => adjustMinute(5)} style={styles.timeBtn}>
                  <Ionicons name="chevron-up" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(tempMinute).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => adjustMinute(-5)} style={styles.timeBtn}>
                  <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.timeHint}>Minutes step by 5</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setTimePickerVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={confirmTime}
              >
                <Text style={styles.modalBtnConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold },
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
  rowValue: { fontSize: TYPOGRAPHY.sm, color: COLORS.textMuted },

  // Time picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: 280,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xl,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timeColumn: { alignItems: 'center', gap: SPACING.sm },
  timeBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '18',
  },
  timeValue: {
    color: COLORS.textPrimary,
    fontSize: 40,
    fontWeight: TYPOGRAPHY.bold,
    width: 70,
    textAlign: 'center',
  },
  timeSep: {
    color: COLORS.textPrimary,
    fontSize: 40,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 8,
  },
  timeHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginBottom: SPACING.xl,
  },
  modalButtons: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: COLORS.surface },
  modalBtnConfirm: { backgroundColor: COLORS.primary },
  modalBtnCancelText: { color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.semibold },
  modalBtnConfirmText: { color: '#FFF', fontWeight: TYPOGRAPHY.semibold },
});
