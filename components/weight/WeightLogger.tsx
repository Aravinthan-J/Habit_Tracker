import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeight } from '@/hooks/useWeight';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function WeightLogger() {
    const { colors: COLORS } = useTheme();
    const styles = makeStyles(COLORS);
    const { todayWeight, logWeight } = useWeight();
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState('');

    const handleSave = () => {
        const val = parseFloat(input);
        if (!isNaN(val) && val > 0 && val < 500) {
            logWeight.mutate(val);
        }
        setEditing(false);
        setInput('');
    };

    return (
        <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
            <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '18' }]}>
                    <Ionicons name="barbell-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.label, { color: COLORS.textPrimary }]}>Weight</Text>
                    {todayWeight ? (
                        <Text style={[styles.value, { color: COLORS.primary }]}>
                            {todayWeight} <Text style={styles.unit}>kg</Text>
                        </Text>
                    ) : (
                        <Text style={[styles.empty, { color: COLORS.textMuted }]}>Not logged today</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: COLORS.primary + '18', borderColor: COLORS.primary + '40' }]}
                    onPress={() => { setInput(todayWeight ? String(todayWeight) : ''); setEditing(true); }}
                >
                    <Ionicons name={todayWeight ? 'pencil-outline' : 'add'} size={16} color={COLORS.primary} />
                    <Text style={[styles.btnText, { color: COLORS.primary }]}>{todayWeight ? 'Edit' : 'Log'}</Text>
                </TouchableOpacity>
            </View>

            {editing && (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { backgroundColor: COLORS.surface, borderColor: COLORS.cardBorder, color: COLORS.textPrimary }]}
                            value={input}
                            onChangeText={setInput}
                            placeholder="e.g. 70.5"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="decimal-pad"
                            autoFocus
                            onSubmitEditing={handleSave}
                        />
                        <Text style={[styles.kgLabel, { color: COLORS.textMuted }]}>kg</Text>
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: COLORS.primary }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditing(false)} hitSlop={8}>
                            <Ionicons name="close" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
    card: {
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        padding: SPACING.md,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    iconWrap: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    info: { flex: 1 },
    label: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
    value: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, marginTop: 1 },
    unit: { fontSize: TYPOGRAPHY.sm, fontWeight: '400' },
    empty: { fontSize: TYPOGRAPHY.xs, marginTop: 1 },
    btn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: SPACING.md, paddingVertical: 6,
        borderRadius: RADIUS.md, borderWidth: 1,
    },
    btnText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    input: {
        flex: 1, borderRadius: RADIUS.md, borderWidth: 1,
        paddingHorizontal: SPACING.md, paddingVertical: 8,
        fontSize: TYPOGRAPHY.md,
    },
    kgLabel: { fontSize: TYPOGRAPHY.sm },
    saveBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: 8,
        borderRadius: RADIUS.md,
    },
    saveBtnText: { color: '#fff', fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold },
});
