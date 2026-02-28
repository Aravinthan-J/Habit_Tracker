import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

interface FocusHighlightsProps {
    totalMinutes: number;
    sessionsCount: number;
}

export default function FocusHighlights({ totalMinutes, sessionsCount }: FocusHighlightsProps) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="timer-outline" size={24} color={COLORS.secondary} />
                </View>
                <View>
                    <Text style={styles.label}>Deep Work Today</Text>
                    <Text style={styles.value}>
                        {hours > 0 ? `${hours}h ` : ''}{mins}m
                    </Text>
                </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.footer}>
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
        borderColor: COLORS.cardBorder,
        backgroundColor: COLORS.surface,
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
        backgroundColor: COLORS.secondary + '20',
    },
    label: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: TYPOGRAPHY.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: COLORS.textSecondary,
    },
    value: {
        fontSize: TYPOGRAPHY.xl,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.textMuted + '20',
        marginVertical: SPACING.md,
    },
    footer: {
        fontSize: TYPOGRAPHY.xs,
        fontStyle: 'italic',
        color: COLORS.textMuted,
    },
});
