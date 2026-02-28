import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useUIStore } from '@/store/uiStore';
import { Metric } from '@/types/advanced.types';

interface MetricLoggerProps {
    key?: string;
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

    const renderInput = () => {
        const metricType = metric.type || 'numeric';

        if (metricType === 'boolean') {
            const isTrue = value === '1';
            return (
                <View style={styles.booleanContainer}>
                    <Text style={[styles.booleanLabel, { color: colors.textPrimary }]}>
                        {isTrue ? 'Yes' : 'No'}
                    </Text>
                    <Switch
                        value={isTrue}
                        onValueChange={(val: boolean) => {
                            setValue(val ? '1' : '0');
                            onLog(val ? 1 : 0);
                        }}
                        trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                        thumbColor="#FFF"
                    />
                </View>
            );
        }

        if (metricType === 'slider') {
            const numVal = parseFloat(value) || 0;
            return (
                <View style={styles.sliderContainer}>
                    <Text style={[styles.sliderValue, { color: colors.primary }]}>{numVal}</Text>
                    <Slider
                        style={{ flex: 1, height: 40 }}
                        minimumValue={0}
                        maximumValue={metric.target_value || 10}
                        step={1}
                        value={numVal}
                        onValueChange={(val: number) => setValue(val.toString())}
                        onSlidingComplete={(val: number) => onLog(val)}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.surfaceLight}
                        thumbTintColor={colors.primary}
                    />
                </View>
            );
        }

        // Default: numeric or time
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceLight }]}
                    value={value}
                    onChangeText={setValue}
                    placeholder={`Value in ${metric.unit}...`}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={!value}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorder || COLORS.cardBorder }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{metric.name}</Text>
                <Text style={[styles.unit, { color: colors.textSecondary }]}>{metric.unit}</Text>
            </View>

            {renderInput()}

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
    booleanContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.xs,
    },
    booleanLabel: {
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.medium,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sliderValue: {
        width: 30,
        fontSize: TYPOGRAPHY.md,
        fontWeight: TYPOGRAPHY.bold,
        textAlign: 'center',
        marginRight: SPACING.sm,
    },
});
