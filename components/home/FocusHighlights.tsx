import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';

interface FocusHighlightsProps {
    totalMinutes: number;
    sessionsCount: number;
}

export default function FocusHighlights({ totalMinutes, sessionsCount }: FocusHighlightsProps) {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                    <Ionicons name="timer-outline" size={24} color={colors.secondary} />
                </View>
                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Deep Work Today</Text>
                    <Text style={[styles.value, { color: colors.textPrimary }]}>
                        {hours > 0 ? `${hours}h ` : ''}{mins}m
                    </Text>
                </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.textMuted + '20' }]} />
            <Text style={[styles.footer, { color: colors.textMuted }]}>
                {sessionsCount} session{sessionsCount !== 1 ? 's' : ''} completed
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.xl,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: TYPOGRAPHY.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: TYPOGRAPHY.bold,
    },
    divider: {
        height: 1,
        marginVertical: SPACING.md,
    },
    footer: {
        fontSize: TYPOGRAPHY.xs,
        fontStyle: 'italic',
    },
});
