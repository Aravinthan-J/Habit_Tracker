import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { TIER_COLORS } from '@/constants/badges';
import { useBadgeProgress } from '@/hooks/useBadgeProgress';
import { formatRemaining } from '@/utils/badgeProgress';
import { usePreferences } from '@/hooks/usePreferences';
import { useNotifications } from '@/hooks/useNotifications';
import { buildBadgeNudgeNotification } from '@/constants/petMessages';

export const BadgeNudgeCard: React.FC = () => {
    const { closest, nearest } = useBadgeProgress();
    const { notificationsEnabled, petTone } = usePreferences();
    const { scheduleBadgeNudge, cancelBadgeNudge } = useNotifications();
    const nudgeKeyRef = useRef<string | null>(null);

    // Schedule a daily roast-toned nudge when a badge is within reach.
    useEffect(() => {
        const key =
            notificationsEnabled && nearest
                ? `${nearest.id}|${nearest.remaining}|${petTone}`
                : 'none';
        if (nudgeKeyRef.current === key) return;
        nudgeKeyRef.current = key;

        if (notificationsEnabled && nearest) {
            const { title, body } = buildBadgeNudgeNotification(
                nearest.name,
                formatRemaining(nearest.remaining, nearest.unit),
                petTone,
            );
            scheduleBadgeNudge(title, body);
        } else {
            cancelBadgeNudge();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notificationsEnabled, petTone, nearest?.id, nearest?.remaining]);

    if (!closest) return null;

    const color = TIER_COLORS[closest.tier as keyof typeof TIER_COLORS] ?? COLORS.primary;

    return (
        <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.header, { color: COLORS.textSecondary }]}>🎯 Almost There</Text>
                <Text style={[styles.percent, { color }]}>{closest.percent}%</Text>
            </View>

            <Text style={[styles.name, { color: COLORS.textPrimary }]} numberOfLines={1}>
                {closest.name}
            </Text>

            <View style={[styles.track, { backgroundColor: COLORS.surface }]}>
                <View style={[styles.fill, { width: `${closest.percent}%`, backgroundColor: color }]} />
            </View>

            <Text style={[styles.sub, { color: COLORS.textMuted }]}>
                {formatRemaining(closest.remaining, closest.unit)} to go · {closest.current}/{closest.target}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    header: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
    percent: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold },
    name: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, marginTop: SPACING.sm },
    track: { height: 7, borderRadius: 4, overflow: 'hidden', marginTop: SPACING.sm },
    fill: { height: '100%', borderRadius: 4 },
    sub: { fontSize: TYPOGRAPHY.xs, marginTop: SPACING.sm },
});
