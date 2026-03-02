import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useHabits } from '@/hooks/useHabits';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { usePreferences } from '@/hooks/usePreferences';
import { Card } from '@/components/ui/Card';
import { HABIT_TEMPLATES, HabitTemplate } from '@/constants/templates';

const SHEET_H = Dimensions.get('window').height * 0.6;

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useAuthStore();
  const { habits, createHabit } = useHabits();
  const { requestAndScheduleDaily, cancelAll } = useNotifications();

  const {
    stepTrackingEnabled, setStepTrackingEnabled,
    notificationsEnabled, setNotificationsEnabled,
    reminderTime, setReminderTime,
  } = usePreferences();
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempHour12, setTempHour12] = useState(8);   // 1–12
  const [tempMinute, setTempMinute]   = useState(0);
  const [tempAmPm, setTempAmPm]       = useState<'AM' | 'PM'>('PM');
  const sheetAnim = useRef(new Animated.Value(SHEET_H)).current;

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

  // ── Time picker helpers ───────────────────────────────────────────────────
  const format12h = (time24: string) => {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12  = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const openTimePicker = () => {
    const [h, m] = reminderTime.split(':').map(Number);
    setTempAmPm(h < 12 ? 'AM' : 'PM');
    setTempHour12(h % 12 === 0 ? 12 : h % 12);
    setTempMinute(m);
    setTimePickerVisible(true);
    sheetAnim.setValue(SHEET_H);
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeTimePicker = () => {
    Animated.timing(sheetAnim, { toValue: SHEET_H, duration: 260, useNativeDriver: true })
      .start(() => setTimePickerVisible(false));
  };

  const confirmTime = async () => {
    let h24 = tempHour12 % 12;
    if (tempAmPm === 'PM') h24 += 12;
    const newTime = `${String(h24).padStart(2, '0')}:${String(tempMinute).padStart(2, '0')}`;
    setReminderTime(newTime);
    closeTimePicker();
    if (notificationsEnabled) await requestAndScheduleDaily(newTime);
  };

  const adjustHour   = (d: number) => setTempHour12((h) => ((h - 1 + d + 12) % 12) + 1);
  const adjustMinute = (d: number) => setTempMinute((m) => (m + d + 60) % 60);

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
            <LinearGradient
              colors={['#FF6B6B', '#A855F7', '#6C63FF', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                </Text>
              </View>
            </LinearGradient>
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

        {/* Health */}
        <Text style={styles.sectionTitle}>Health</Text>
        <Card style={styles.section}>
          <SettingsRow
            icon="footsteps-outline"
            label="Step Tracking"
            right={
              <Switch
                value={stepTrackingEnabled}
                onValueChange={setStepTrackingEnabled}
                trackColor={{ false: COLORS.surface, true: COLORS.primary + '88' }}
                thumbColor={stepTrackingEnabled ? COLORS.primary : COLORS.textMuted}
                accessibilityLabel="Toggle step tracking"
              />
            }
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
          <SettingsRow
            icon="time-outline"
            label="Reminder Time"
            value={format12h(reminderTime)}
            onPress={openTimePicker}
          />
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.section}>
          <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <SettingsRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => router.push('/privacy')}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => router.push('/support')}
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

      {/* Time Picker Sheet */}
      <Modal visible={timePickerVisible} transparent animationType="none" onRequestClose={closeTimePicker}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeTimePicker} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>Set Reminder Time</Text>

          {/* Time preview */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>
              {String(tempHour12).padStart(2, '0')}:{String(tempMinute).padStart(2, '0')}
            </Text>
            <Text style={styles.timePreviewAmPm}>{tempAmPm}</Text>
          </View>

          {/* Pickers row */}
          <View style={styles.pickersRow}>
            {/* Hour */}
            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustHour(1)}>
                <Ionicons name="chevron-up" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.stepValueBox}>
                <Text style={styles.stepValue}>{String(tempHour12).padStart(2, '0')}</Text>
              </View>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustHour(-1)}>
                <Ionicons name="chevron-down" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.colon}>:</Text>

            {/* Minute */}
            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Min</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMinute(5)}>
                <Ionicons name="chevron-up" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.stepValueBox}>
                <Text style={styles.stepValue}>{String(tempMinute).padStart(2, '0')}</Text>
              </View>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMinute(-5)}>
                <Ionicons name="chevron-down" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* AM / PM */}
            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Period</Text>
              <TouchableOpacity
                style={[styles.amPmBtn, tempAmPm === 'AM' && styles.amPmBtnActive]}
                onPress={() => setTempAmPm('AM')}
              >
                <Text style={[styles.amPmText, tempAmPm === 'AM' && styles.amPmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmBtn, tempAmPm === 'PM' && styles.amPmBtnActive]}
                onPress={() => setTempAmPm('PM')}
              >
                <Text style={[styles.amPmText, tempAmPm === 'PM' && styles.amPmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sheetHint}>Minutes step by 5</Text>

          {/* Notification preview */}
          <View style={styles.notifPreview}>
            <View style={styles.notifAccent} />
            <View style={styles.notifIconWrap}>
              <Ionicons name="notifications" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.notifTextWrap}>
              <Text style={styles.notifTitle}>🎯 Time to check in!</Text>
              <Text style={styles.notifBody}>Don't break your streak — mark your habits now.</Text>
              <Text style={styles.notifTime}>
                Today at {String(tempHour12).padStart(2, '0')}:{String(tempMinute).padStart(2, '0')} {tempAmPm}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeTimePicker}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmTime}>
              <Text style={styles.confirmBtnText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: COLORS.overlay,
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

  // Time picker sheet
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 36,
    paddingTop: SPACING.sm,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted + '60',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  timePreview: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  timePreviewText: {
    color: COLORS.primary,
    fontSize: 52,
    fontWeight: TYPOGRAPHY.extrabold,
    letterSpacing: 2,
  },
  timePreviewAmPm: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 10,
  },
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  pickerCol: { alignItems: 'center', gap: SPACING.sm },
  pickerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepValueBox: {
    width: 72,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepValue: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.bold,
  },
  colon: {
    color: COLORS.textSecondary,
    fontSize: 36,
    fontWeight: TYPOGRAPHY.bold,
    marginTop: 20,
  },
  amPmBtn: {
    width: 64,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amPmBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  amPmText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  amPmTextActive: { color: '#fff' },
  sheetHint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, textAlign: 'center', marginBottom: SPACING.md },
  notifPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  notifAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  notifIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTextWrap: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  notifTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: 2,
  },
  notifBody: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.xs,
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
  sheetActions: { flexDirection: 'row', gap: SPACING.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cancelBtnText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  confirmBtn: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },
});
