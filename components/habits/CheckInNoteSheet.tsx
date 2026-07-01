import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { saveCompletionNoteLocally } from '@/services/storage/LocalStorageService';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
    visible: boolean;
    habitId: string;
    habitTitle: string;
    date: string;
    onDone: () => void;
}

export function CheckInNoteSheet({ visible, habitId, habitTitle, date, onDone }: Props) {
    const { colors: COLORS } = useTheme();
    const styles = makeStyles(COLORS);
    const { user } = useAuthStore();
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setNote('');
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [visible]);

    const saveNote = async () => {
        if (!note.trim() || !user) { onDone(); return; }
        setSaving(true);
        try {
            const dailyRef = doc(db, 'users', user.uid, 'daily', date);
            await setDoc(dailyRef, { [`notes`]: { [habitId]: note.trim() } }, { merge: true });
            await saveCompletionNoteLocally(habitId, date, note.trim());
        } catch { }
        setSaving(false);
        onDone();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onDone}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => { Keyboard.dismiss(); onDone(); }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrap}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Text style={styles.emoji}>✅</Text>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Nice work!</Text>
                            <Text style={styles.sub} numberOfLines={1}>{habitTitle}</Text>
                        </View>
                        <TouchableOpacity onPress={onDone} hitSlop={12}>
                            <Ionicons name="close" size={22} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.label}>Add a note <Text style={styles.optional}>(optional)</Text></Text>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder="How did it go? Any thoughts..."
                        placeholderTextColor={COLORS.textMuted}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        maxLength={280}
                        returnKeyType="done"
                        onSubmitEditing={saveNote}
                    />
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.skipBtn} onPress={onDone}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: COLORS.primary }]}
                            onPress={saveNote}
                            disabled={saving}
                        >
                            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Note'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    wrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    sheet: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: SPACING.xl,
        paddingBottom: 36,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: COLORS.textMuted,
        alignSelf: 'center', marginBottom: SPACING.lg,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
    emoji: { fontSize: 28 },
    headerText: { flex: 1 },
    title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold },
    sub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginTop: 2 },
    label: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, marginBottom: SPACING.sm },
    optional: { color: COLORS.textMuted, fontWeight: '400' },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.md,
        padding: SPACING.md,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: SPACING.lg,
    },
    actions: { flexDirection: 'row', gap: SPACING.md },
    skipBtn: {
        flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md,
        borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center',
    },
    skipText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
    saveBtn: { flex: 2, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
    saveText: { color: '#fff', fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },
});
