import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const CONTACT_EMAIL = 'support@habity.app';

const FAQS = [
  {
    q: 'How do I add a new habit?',
    a: 'Tap the + button on the Habits tab. Give your habit a name, pick an icon and color, then save. It will appear on your home screen right away.',
  },
  {
    q: 'How are streaks calculated?',
    a: 'A streak counts the number of consecutive days you completed all your habits. Missing a single day resets the streak to zero, so try to check in every day!',
  },
  {
    q: 'Does the app work offline?',
    a: 'Yes. All changes you make offline are saved locally and automatically synced to the cloud the next time you have an internet connection.',
  },
  {
    q: 'How do I set a daily reminder?',
    a: 'Go to Settings → Notifications. Toggle on "Daily Reminder", then tap "Reminder Time" to pick the exact hour and minute.',
  },
  {
    q: 'Why isn\'t my step count showing on Android?',
    a: 'Android requires the app to be running in the background to count steps. Make sure battery optimisation is disabled for Habity in your phone\'s settings.',
  },
  {
    q: 'How do I use Focus Mode?',
    a: 'Go to Settings → Focus Mode. Pick a duration (25, 45, or 60 minutes), then press Play. You can also flip your phone face-down to auto-start the timer.',
  },
  {
    q: 'How do I delete a habit?',
    a: 'Open the habit by tapping its name, then scroll to the bottom and tap "Delete Habit". This removes the habit and hides its past completions from your stats.',
  },
  {
    q: 'How do I earn badges?',
    a: 'Badges are awarded automatically when you hit milestones — like a 7-day streak, completing 50 habits, or finishing your first Focus session. Check the Badges tab to see your progress.',
  },
  {
    q: 'Can I change my reminder time later?',
    a: 'Yes, just tap "Reminder Time" in Settings at any time. The new time takes effect immediately and replaces the old reminder.',
  },
  {
    q: 'What are Smart Reminders?',
    a: 'When you turn on Smart Reminder for a habit, Habity learns the time of day you usually complete it and nudges you around then — but only if you haven\'t already done it that day. The more consistently you log it, the smarter the timing gets.',
  },
  {
    q: 'How does Habit Stacking work?',
    a: 'When editing a habit you can "Stack After" another habit. Once you complete the first habit, Habity reminds you to do the stacked one next — a proven way to build new routines on top of existing ones.',
  },
  {
    q: 'Where is the Weekly Review?',
    a: 'Open the Analytics tab and tap "Weekly Review", or tap the Sunday recap notification. It shows your completion rate, best and worst habits, and streaks gained or lost — with a shareable summary card.',
  },
  {
    q: 'Can I switch between dark and light mode?',
    a: 'Yes. Go to Settings → Appearance and choose Light, Dark, or System (which follows your phone\'s setting). The change applies instantly across the whole app.',
  },
  {
    q: 'How do I delete my account?',
    a: `Email us at ${CONTACT_EMAIL} with the subject "Delete My Account". We will permanently remove all your data within 7 days.`,
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen((v) => !v)}
      activeOpacity={0.75}
    >
      <View style={styles.faqRow}>
        <Text style={styles.faqQuestion}>{q}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textMuted}
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{a}</Text>}
    </TouchableOpacity>
  );
}

function ContactCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
    <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.contactText}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function HelpSupport() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy-outline" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>
            Browse the FAQs below or reach out — we usually reply within 24 hours.
          </Text>
        </View>

        {/* Contact options */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>
        <View style={styles.contactGroup}>
          <ContactCard
            icon="mail-outline"
            title="Email Support"
            subtitle={CONTACT_EMAIL}
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Habity Support`)}
          />
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqGroup}>
          {FAQS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </View>

        {/* Known limitations */}
        <Text style={styles.sectionLabel}>KNOWN LIMITATIONS</Text>
        <View style={styles.limitsGroup}>
          {[
            { icon: 'walk-outline' as const, text: 'Step counting on Android requires the app to be active in the background.' },
            { icon: 'notifications-outline' as const, text: 'Notifications require permission granted in your device settings.' },
            { icon: 'cloud-offline-outline' as const, text: 'Real-time sync requires an internet connection; offline changes sync on reconnect.' },
          ].map((item, i) => (
            <View key={i} style={styles.limitRow}>
              <View style={styles.limitIconWrap}>
                <Ionicons name={item.icon} size={18} color={COLORS.textMuted} />
              </View>
              <Text style={styles.limitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },

  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },

  hero: { alignItems: 'center', paddingVertical: SPACING.xl },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  heroSub: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },

  // Contact
  contactGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: { flex: 1 },
  contactTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
  contactSubtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginTop: 2,
  },

  // FAQ
  faqGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  faqItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  faqQuestion: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    flex: 1,
    lineHeight: 20,
  },
  faqAnswer: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 21,
    marginTop: SPACING.sm,
  },

  // Limitations
  limitsGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  limitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  limitText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 21,
    flex: 1,
  },
});
