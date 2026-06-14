import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Metric } from '@/types/advanced.types';

interface MetricLoggerProps {
    key?: string;
    metric: Metric;
    onLog: (value: number) => void;
}

export default function MetricLogger({ metric, onLog }: MetricLoggerProps) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
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
                    <Text style={styles.booleanLabel}>
                        {isTrue ? 'Yes' : 'No'}
                    </Text>
                    <Switch
                        value={isTrue}
                        onValueChange={(val: boolean) => {
                            setValue(val ? '1' : '0');
                            onLog(val ? 1 : 0);
                        }}
                        trackColor={{ false: COLORS.surface, true: COLORS.primary }}
                        thumbColor="#FFF"
                    />
                </View>
            );
        }

        if (metricType === 'slider') {
            const numVal = parseFloat(value) || 0;
            return (
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderValue}>{numVal}</Text>
                    <Slider
                        style={{ flex: 1, height: 40 }}
                        minimumValue={0}
                        maximumValue={metric.target_value || 10}
                        step={1}
                        value={numVal}
                        onValueChange={(val: number) => setValue(val.toString())}
                        onSlidingComplete={(val: number) => onLog(val)}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.surface}
                        thumbTintColor={COLORS.primary}
                    />
                </View>
            );
        }

        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    placeholder={`Value in ${metric.unit}...`}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={!value}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{metric.name}</Text>
                <Text style={styles.unit}>{metric.unit}</Text>
            </View>

            {renderInput()}

            {metric.target_value && (
                <View style={styles.progressContainer}>
                    <Text style={styles.targetText}>
                        Target: {metric.target_value} {metric.unit}
                    </Text>
                </View>
            )}
        </View>
    );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
    container: {
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.cardBorder,
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
        color: COLORS.textPrimary,
    },
    unit: {
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.textSecondary,
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
        color: COLORS.textPrimary,
        backgroundColor: COLORS.background,
    },
    button: {
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.primary,
    },
    progressContainer: {
        marginTop: SPACING.xs,
    },
    targetText: {
        fontSize: TYPOGRAPHY.xs,
        fontStyle: 'italic',
        color: COLORS.textMuted,
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
        color: COLORS.textPrimary,
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
        color: COLORS.primary,
    },
});
