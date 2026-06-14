import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const LAST_UPDATED = 'March 2025';
const CONTACT_EMAIL = 'support@habity.app';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return <Text style={styles.para}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicy() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        <Para>
          Habity is a personal habit tracking app built to help you build better daily routines.
          Your privacy matters. This policy explains what data we collect, how we use it, and how it's protected.
        </Para>

        <Section title="1. Data We Collect">
          <Para>We collect only what's necessary to run the app:</Para>
          <Bullet>Email address — used to create and identify your account</Bullet>
          <Bullet>Display name — shown on your profile (optional)</Bullet>
          <Bullet>Habits, completions, and streaks — the core content you create</Bullet>
          <Bullet>Step count — read from your device pedometer, stored per day</Bullet>
          <Bullet>Focus session durations — recorded when you use Focus Mode</Bullet>
          <Bullet>Custom metrics and logs — only if you create them</Bullet>
        </Section>

        <Section title="2. How We Use Your Data">
          <Bullet>To sync your habits and progress across devices</Bullet>
          <Bullet>To calculate streaks, badges, and analytics shown only to you</Bullet>
          <Bullet>To send daily reminder notifications (only if you enable them)</Bullet>
          <Bullet>We do not use your data for advertising</Bullet>
          <Bullet>We do not sell or share your data with third parties</Bullet>
        </Section>

        <Section title="3. Data Storage & Security">
          <Para>
            Your data is stored in Google Firebase (Firestore), protected by Firebase Authentication.
            Each user's data is fully isolated — only you can read or write your own records.
          </Para>
          <Para>
            A local copy is also cached on your device (SQLite) so the app works offline.
            This local data stays on your device and is removed when you uninstall the app.
          </Para>
        </Section>

        <Section title="4. Notifications">
          <Para>
            If you enable daily reminders, we schedule a local notification on your device at your chosen time.
            No notification content is sent to our servers. You can disable reminders anytime in Settings.
          </Para>
        </Section>

        <Section title="5. Step & Health Data">
          <Para>
            Step count is read from your device's built-in pedometer (iOS) or motion sensors (Android).
            This data is stored only in your account and is never shared with health platforms or third parties.
          </Para>
        </Section>

        <Section title="6. Data Deletion">
          <Para>
            You can request deletion of your account and all associated data at any time by contacting us at{' '}
            <Text style={styles.link}>{CONTACT_EMAIL}</Text>.
            We will permanently delete your data within 7 days of your request.
          </Para>
        </Section>

        <Section title="7. Children's Privacy">
          <Para>
            Habity is not directed at children under 13. We do not knowingly collect data from anyone under 13.
          </Para>
        </Section>

        <Section title="8. Changes to This Policy">
          <Para>
            If we make significant changes to this policy, we'll update the date at the top of this page.
            Continued use of the app after changes means you accept the updated policy.
          </Para>
        </Section>

        <Section title="9. Contact">
          <Para>
            Questions or concerns? Reach us at{' '}
            <Text style={styles.link}>{CONTACT_EMAIL}</Text>
          </Para>
        </Section>

        <View style={{ height: 40 }} />
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
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  updated: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginBottom: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.sm,
  },
  para: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  bulletDot: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 22,
  },
  bulletText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 22,
    flex: 1,
  },
  link: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
