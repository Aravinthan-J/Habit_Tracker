import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { Metric } from '@/types/advanced.types';

interface MetricHighlightsProps {
    metrics: Metric[];
}

export default function MetricHighlights({ metrics }: MetricHighlightsProps) {
    if (metrics.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Metric Highlights</Text>
            <View style={styles.grid}>
                {metrics.slice(0, 4).map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.metricName}>{item.name}</Text>
                        <View style={styles.valueRow}>
                            <Text style={styles.value}>
                                {item.target_value || '--'}
                            </Text>
                            <Text style={styles.unit}>{item.unit}</Text>
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
        color: COLORS.textSecondary,
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
        backgroundColor: COLORS.surface,
        borderColor: COLORS.cardBorder,
    },
    metricName: {
        fontSize: TYPOGRAPHY.xs,
        fontWeight: TYPOGRAPHY.medium,
        marginBottom: SPACING.xs,
        color: COLORS.textSecondary,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: TYPOGRAPHY.lg,
        fontWeight: TYPOGRAPHY.bold,
        color: COLORS.primary,
    },
    unit: {
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.textMuted,
    },
});
