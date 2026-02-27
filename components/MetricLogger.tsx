import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { Metric } from '@/types/advanced.types';

interface MetricLoggerProps {
    metric: Metric;
    onLog: (value: number) => void;
}

export default function MetricLogger({ metric, onLog }: MetricLoggerProps) {
    const { premiumTheme } = useUIStore();
    const colors = premiumTheme?.colors || COLORS;
    const [value, setValue] = useState('');

    const handleSubmit = () => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            onLog(numValue);
            setValue('');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{metric.name}</Text>
                <Text style={[styles.unit, { color: colors.textSecondary }]}>{metric.unit}</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceLight }]}
                    value={value}
                    onChangeText={setValue}
                    placeholder="Value..."
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {metric.target_value && (
                <View style={styles.progressContainer}>
                    <Text style={[styles.targetText, { color: colors.textMuted }]}>
                        Target: {metric.target_value} {metric.unit}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.bold,
    },
    unit: {
        fontSize: TYPOGRAPHY.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
        marginRight: SPACING.sm,
        fontSize: TYPOGRAPHY.md,
    },
    button: {
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
    },
    progressContainer: {
        marginTop: SPACING.xs,
    },
    targetText: {
        fontSize: TYPOGRAPHY.xs,
        fontStyle: 'italic',
    },
});
