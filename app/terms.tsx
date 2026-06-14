import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const LAST_UPDATED = 'March 1, 2026';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const styles = makeStyles(useTheme().colors);
    return (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
    );
};

const Para = ({ children }: { children: string }) => {
    const styles = makeStyles(useTheme().colors);
    return <Text style={styles.para}>{children}</Text>;
};

const Bullet = ({ children }: { children: string }) => {
    const styles = makeStyles(useTheme().colors);
    return <Text style={styles.bullet}>• {children}</Text>;
};

export default function TermsScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
                <Para>
                    Welcome to Habity. By creating an account or using the app, you agree to these Terms of Service. Please read them carefully.
                </Para>

                <Section title="1. Acceptance of Terms">
                    <Para>
                        By accessing or using Habity, you confirm that you are at least 13 years old and agree to be bound by these terms. If you do not agree, do not use the app.
                    </Para>
                </Section>

                <Section title="2. Your Account">
                    <Para>You are responsible for:</Para>
                    <Bullet>Keeping your login credentials secure</Bullet>
                    <Bullet>All activity that occurs under your account</Bullet>
                    <Bullet>Providing accurate information when registering</Bullet>
                </Section>

                <Section title="3. Acceptable Use">
                    <Para>You agree not to:</Para>
                    <Bullet>Use the app for any unlawful purpose</Bullet>
                    <Bullet>Attempt to reverse-engineer or tamper with the app</Bullet>
                    <Bullet>Upload harmful, offensive, or malicious content</Bullet>
                    <Bullet>Impersonate another person or entity</Bullet>
                </Section>

                <Section title="4. Your Data">
                    <Para>
                        Your habit data, completions, and personal information are stored securely. We do not sell your data to third parties. See our Privacy Policy for full details on data handling.
                    </Para>
                </Section>

                <Section title="5. App Availability">
                    <Para>
                        We strive to keep Habity available at all times, but we do not guarantee uninterrupted access. We may update, modify, or discontinue features at any time without prior notice.
                    </Para>
                </Section>

                <Section title="6. Intellectual Property">
                    <Para>
                        All content, design, and code within Habity is owned by or licensed to us. You may not copy, distribute, or create derivative works without our written permission.
                    </Para>
                </Section>

                <Section title="7. Disclaimer of Warranties">
                    <Para>
                        Habity is provided "as is" without warranties of any kind. We are not responsible for any loss of data or interruption to your habit tracking routine.
                    </Para>
                </Section>

                <Section title="8. Changes to Terms">
                    <Para>
                        We may update these terms from time to time. Continued use of the app after changes are posted means you accept the updated terms.
                    </Para>
                </Section>

                <Section title="9. Contact">
                    <Para>
                        If you have questions about these terms, contact us at support@habity.app.
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
    backBtn: { width: 40, alignItems: 'flex-start' },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.lg,
        fontWeight: TYPOGRAPHY.semibold,
    },
    content: { padding: SPACING.xl },
    updated: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, marginBottom: SPACING.lg },
    section: { marginTop: SPACING.xl },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.semibold,
        marginBottom: SPACING.sm,
    },
    para: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sm,
        lineHeight: 22,
        marginBottom: SPACING.sm,
    },
    bullet: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sm,
        lineHeight: 22,
        marginLeft: SPACING.sm,
        marginBottom: 4,
    },
});
