import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { Metric } from '@/types/advanced.types';

interface MetricHighlightsProps {
    metrics: Metric[];
}

export default function MetricHighlights({ metrics }: MetricHighlightsProps) {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;

    if (metrics.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Metric Highlights</Text>
            <View style={styles.grid}>
                {metrics.slice(0, 4).map((item) => (
                    <View key={item.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
                        <Text style={[styles.metricName, { color: colors.textSecondary }]}>{item.name}</Text>
                        <View style={styles.valueRow}>
                            <Text style={[styles.value, { color: colors.primary }]}>
                                {item.target_value || '--'}
                            </Text>
                            <Text style={[styles.unit, { color: colors.textMuted }]}>{item.unit}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sm,
        fontWeight: TYPOGRAPHY.medium,
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING.md,
    },
    card: {
        width: '45%',
        margin: '2.5%',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    metricName: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: TYPOGRAPHY.medium,
        marginBottom: SPACING.xs,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: TYPOGRAPHY.bold,
    },
    unit: {
        fontSize: TYPOGRAPHY.xs,
    },
});
