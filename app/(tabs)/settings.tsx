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
  Share,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useHabits } from '@/hooks/useHabits';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors, ACCENT_PRESETS } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { usePreferences } from '@/hooks/usePreferences';
import { Card } from '@/components/ui/Card';
import { HABIT_TEMPLATES, HabitTemplate } from '@/constants/templates';
import { today, formatDate, friendlyDate } from '@/utils/dateHelpers';
import { isVacationActive } from '@/utils/vacation';

const SHEET_H = Dimensions.get('window').height * 0.6;

export default function SettingsScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const router = useRouter();
  const { signOut, updateDisplayName, updateProfilePhoto } = useAuth();
  const { user } = useAuthStore();
  const { habits, createHabit } = useHabits();
  const { requestAndScheduleDaily, cancelAll, scheduleWater, cancelWater } = useNotifications();

  const {
    themeMode, setThemeMode,
    accentColor, setAccentColor,
    petTone, setPetTone,
    stepTrackingEnabled, setStepTrackingEnabled,
    notificationsEnabled, setNotificationsEnabled,
    reminderTime, setReminderTime,
    waterReminderEnabled, setWaterReminderEnabled,
    waterIntervalHours, setWaterIntervalHours,
    smartRemindersEnabled, setSmartRemindersEnabled,
    weeklyReviewEnabled, setWeeklyReviewEnabled,
    vacationStart, vacationEnd, setVacation,
  } = usePreferences();

  const onVacation = isVacationActive(vacationStart, vacationEnd);
  const toggleVacation = (value: boolean) => {
    if (value) {
      setVacation(today(), null);
    } else {
      // End vacation yesterday so today resumes as a normal tracked day.
      const y = new Date(); y.setDate(y.getDate() - 1);
      setVacation(vacationStart ?? today(), formatDate(y));
    }
  };
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempHour12, setTempHour12] = useState(8);   // 1–12
  const [tempMinute, setTempMinute]   = useState(0);
  const [tempAmPm, setTempAmPm]       = useState<'AM' | 'PM'>('PM');
  const sheetAnim = useRef(new Animated.Value(SHEET_H)).current;

  // ── Edit profile name ───────────────────────────────────────────────────────
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const openNameEditor = () => {
    setNameDraft(user?.displayName ?? '');
    setNameModalVisible(true);
  };
  const saveName = async () => {
    if (!nameDraft.trim()) return;
    setSavingName(true);
    const { error } = await updateDisplayName(nameDraft);
    setSavingName(false);
    if (error) { Alert.alert('Could not save', error.message); return; }
    setNameModalVisible(false);
  };

  // ── Profile photo ───────────────────────────────────────────────────────────
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickProfilePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingPhoto(true);
    const { error } = await updateProfilePhoto(result.assets[0].uri);
    setUploadingPhoto(false);
    if (error) Alert.alert('Could not update photo', error.message);
  };

  // ── What's New ────────────────────────────────────────────────────────────
  const [whatsNewVisible, setWhatsNewVisible] = useState(false);

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

  // ── Water reminder ──────────────────────────────────────────────────────────
  const toggleWaterReminder = async (value: boolean) => {
    setWaterReminderEnabled(value);
    if (value) {
      const success = await scheduleWater(waterIntervalHours);
      if (!success) {
        setWaterReminderEnabled(false);
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
      }
    } else {
      await cancelWater();
    }
  };

  const cycleWaterInterval = async () => {
    const options = [1, 2, 3, 4];
    const next = options[(options.indexOf(waterIntervalHours) + 1) % options.length];
    setWaterIntervalHours(next);
    if (waterReminderEnabled) await scheduleWater(next);
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
            <TouchableOpacity onPress={pickProfilePhoto} activeOpacity={0.8} accessibilityLabel="Change profile picture">
              <LinearGradient
                colors={['#FF6B6B', '#A855F7', '#6C63FF', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <View style={styles.avatar}>
                  {uploadingPhoto ? (
                    <ActivityIndicator color={COLORS.textPrimary} />
                  ) : user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </Text>
                  )}
                </View>
              </LinearGradient>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileInfo} onPress={openNameEditor} activeOpacity={0.8} accessibilityLabel="Edit profile name">
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user?.displayName ?? 'Habity User'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
              <View style={styles.editPill}>
                <Ionicons name="pencil" size={14} color={COLORS.primary} />
                <Text style={styles.editPillText}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.section}>
          <View style={styles.appearanceRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Theme</Text>
            </View>
          </View>
          <View style={styles.segment}>
            {([
              { key: 'light', label: 'Light', icon: 'sunny-outline' as const },
              { key: 'dark', label: 'Dark', icon: 'moon-outline' as const },
              { key: 'system', label: 'System', icon: 'phone-portrait-outline' as const },
            ]).map((opt) => {
              const active = themeMode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => setThemeMode(opt.key as any)}
                  accessibilityLabel={`Theme ${opt.label}`}
                >
                  <Ionicons name={opt.icon} size={18} color={active ? '#fff' : COLORS.textSecondary} />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Accent color */}
          <View style={[styles.appearanceRow, { marginTop: SPACING.md }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="brush-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Accent Color</Text>
            </View>
          </View>
          <View style={styles.accentRow}>
            {ACCENT_PRESETS.map((c) => {
              const active = accentColor.toUpperCase() === c.toUpperCase();
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setAccentColor(c)}
                  style={[styles.accentDot, { backgroundColor: c }, active && { borderColor: COLORS.textPrimary, borderWidth: 3 }]}
                  accessibilityLabel={`Accent color ${c}${active ? ', selected' : ''}`}
                >
                  {active && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>

          <SettingsRow
            emojiIcon={petTone === 'gentle' ? '😇' : '🔥'}
            label="Pet Personality"
            value={petTone === 'gentle' ? 'Gentle' : 'Savage'}
            onPress={() => setPetTone(petTone === 'gentle' ? 'savage' : 'gentle')}
          />
        </Card>

        {/* Vacation Mode */}
        <Text style={styles.sectionTitle}>Vacation Mode</Text>
        <Card style={styles.section}>
          <SettingsRow
            emojiIcon="🏖️"
            label="Vacation Mode"
            right={
              <Switch
                value={onVacation}
                onValueChange={toggleVacation}
                trackColor={{ false: COLORS.surface, true: COLORS.primary + '88' }}
                thumbColor={onVacation ? COLORS.primary : COLORS.textMuted}
                accessibilityLabel="Toggle vacation mode"
              />
            }
          />
          <Text style={styles.vacationHint}>
            {onVacation
              ? `On since ${friendlyDate(vacationStart!)} — missed days won't break your streaks, freezes are paused, and reminders are silenced.`
              : 'Going away or feeling unwell? Pause your habits so missed days don\'t break your streaks.'}
          </Text>
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
          <SettingsRow
            icon="water-outline"
            label="Water Reminder"
            right={
              <Switch
                value={waterReminderEnabled}
                onValueChange={toggleWaterReminder}
                trackColor={{ false: COLORS.surface, true: COLORS.primary + '88' }}
                thumbColor={waterReminderEnabled ? COLORS.primary : COLORS.textMuted}
                accessibilityLabel="Toggle water reminder"
              />
            }
          />
          {waterReminderEnabled && (
            <SettingsRow
              icon="repeat-outline"
              label="Water Interval"
              value={`Every ${waterIntervalHours} ${waterIntervalHours === 1 ? 'hour' : 'hours'}`}
              onPress={cycleWaterInterval}
            />
          )}
          <SettingsRow
            icon="bulb-outline"
            label="Smart Reminders"
            right={
              <Switch
                value={smartRemindersEnabled}
                onValueChange={setSmartRemindersEnabled}
                trackColor={{ false: COLORS.surface, true: COLORS.primary + '88' }}
                thumbColor={smartRemindersEnabled ? COLORS.primary : COLORS.textMuted}
                accessibilityLabel="Toggle smart reminders"
              />
            }
          />
          <SettingsRow
            icon="stats-chart-outline"
            label="Weekly Review"
            right={
              <Switch
                value={weeklyReviewEnabled}
                onValueChange={setWeeklyReviewEnabled}
                trackColor={{ false: COLORS.surface, true: COLORS.primary + '88' }}
                thumbColor={weeklyReviewEnabled ? COLORS.primary : COLORS.textMuted}
                accessibilityLabel="Toggle weekly review reminder"
              />
            }
          />
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.section}>
          <SettingsRow
            icon="sparkles-outline"
            label="What's New"
            color={COLORS.primary}
            onPress={() => setWhatsNewVisible(true)}
          />
          <SettingsRow icon="information-circle-outline" label="Version" value="1.1.0" />
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
          <SettingsRow
            icon="reader-outline"
            label="Terms of Service"
            onPress={() => router.push('/terms')}
          />
          <SettingsRow
            icon="share-social-outline"
            label="Share Habity"
            onPress={() => Share.share({ message: 'Build better habits with Habity — track streaks, earn badges and stay consistent! 🎯' })}
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

      {/* Edit name modal */}
      <Modal visible={nameModalVisible} transparent animationType="fade" onRequestClose={() => setNameModalVisible(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setNameModalVisible(false)} />
        <View style={styles.centerModalWrap} pointerEvents="box-none">
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Edit your name</Text>
            <TextInput
              style={styles.nameInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Your name"
              placeholderTextColor={COLORS.textMuted}
              maxLength={40}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNameModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={saveName} disabled={savingName || !nameDraft.trim()}>
                <Text style={styles.confirmBtnText}>{savingName ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* What's New modal */}
      <Modal visible={whatsNewVisible} transparent animationType="fade" onRequestClose={() => setWhatsNewVisible(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setWhatsNewVisible(false)} />
        <View style={styles.centerModalWrap} pointerEvents="box-none">
          <View style={styles.dialog}>
            <Text style={styles.whatsNewEmoji}>✨</Text>
            <Text style={styles.dialogTitle}>What's New</Text>
            <Text style={styles.whatsNewVersion}>Version 1.1.0</Text>
            <ScrollView style={styles.whatsNewList} showsVerticalScrollIndicator={false}>
              {[
                { icon: '🌗', title: 'Dark & Light themes', body: 'Pick Light, Dark or System in Appearance.' },
                { icon: '🗓️', title: 'Weekly habits', body: 'Track habits you do once a week, with weekly streaks.' },
                { icon: '🔔', title: 'Notification quick-actions', body: 'Mark a habit done or snooze it right from the reminder.' },
                { icon: '🧊', title: 'Streak Freeze', body: 'A missed day is auto-protected so your streak survives.' },
                { icon: '📊', title: 'Smarter analytics & review', body: 'Weekly habits now counted fairly everywhere.' },
              ].map((item, i) => (
                <View key={i} style={styles.whatsNewRow}>
                  <Text style={styles.whatsNewRowEmoji}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.whatsNewRowTitle}>{item.title}</Text>
                    <Text style={styles.whatsNewRowBody}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.confirmBtn, { alignSelf: 'stretch', marginTop: SPACING.md }]} onPress={() => setWhatsNewVisible(false)}>
              <Text style={styles.confirmBtnText}>Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
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
  avatarImg: { width: '100%', height: '100%', borderRadius: 27 },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  profileName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  profileEmail: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '18',
    borderColor: COLORS.primary + '40',
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  editPillText: { color: COLORS.primary, fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },

  // Centered dialogs (edit name, what's new)
  centerModalWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  dialog: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  dialogTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, marginBottom: SPACING.md },
  nameInput: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    marginBottom: SPACING.lg,
  },
  whatsNewEmoji: { fontSize: 36 },
  whatsNewVersion: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginBottom: SPACING.lg },
  whatsNewList: { alignSelf: 'stretch' },
  whatsNewRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg, alignItems: 'flex-start' },
  whatsNewRowEmoji: { fontSize: 22, width: 28, textAlign: 'center' },
  whatsNewRowTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  whatsNewRowBody: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, lineHeight: 19, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  appearanceRow: { flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.sm },
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    gap: 4,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  segmentBtnActive: { backgroundColor: COLORS.primary },
  segmentText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
  segmentTextActive: { color: '#fff' },
  vacationHint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, lineHeight: 17, paddingTop: SPACING.sm },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  accentDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
  },
  rowIcon: { marginRight: SPACING.md },
  rowLabel: { fontSize: TYPOGRAPHY.md },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexShrink: 0 },
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
