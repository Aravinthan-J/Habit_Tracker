import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { MAX_FREEZES, FREEZE_EARN_EVERY } from '@/store/streakFreezeStore';
import { friendlyDate } from '@/utils/dateHelpers';

interface Props {
  visible: boolean;
  onClose: () => void;
  balance: number;
  maxFreezes: number;
  freezeDates: string[];
}

export function StreakFreezeModal({ visible, onClose, balance, maxFreezes, freezeDates }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  // Most recent protected days first.
  const recent = [...freezeDates].sort().reverse().slice(0, 8);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.icon}>🧊</Text>
        <Text style={styles.title}>Streak Freeze</Text>

        {/* Balance dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: maxFreezes }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i < balance ? COLORS.info : COLORS.surfaceLight }]}
            >
              <Text style={styles.dotEmoji}>{i < balance ? '🧊' : ''}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.balanceLabel}>
          {balance} of {maxFreezes} freezes available
        </Text>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <InfoRow
            COLORS={COLORS}
            icon="shield-checkmark-outline"
            title="Protects your streak"
            text="Miss a single day and a freeze is spent automatically to keep your streak alive — no action needed."
          />
          <InfoRow
            COLORS={COLORS}
            icon="gift-outline"
            title="Earned by consistency"
            text={`You earn 1 freeze for every ${FREEZE_EARN_EVERY}-day streak, up to ${MAX_FREEZES} stored at once.`}
          />
          <InfoRow
            COLORS={COLORS}
            icon="snow-outline"
            title="One day at a time"
            text="A freeze only covers an isolated missed day. Two missed days in a row will still reset your streak."
          />

          {recent.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>RECENTLY PROTECTED</Text>
              <View style={styles.protectedGroup}>
                {recent.map((d) => (
                  <View key={d} style={styles.protectedRow}>
                    <Text style={styles.protectedEmoji}>🧊</Text>
                    <Text style={styles.protectedDate}>{friendlyDate(d)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function InfoRow({ COLORS, icon, title, text }: {
  COLORS: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  const styles = makeStyles(COLORS);
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={COLORS.info} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 36,
    paddingTop: SPACING.sm,
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.textMuted + '60',
    marginBottom: SPACING.lg,
  },
  icon: { fontSize: 40 },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, marginTop: SPACING.xs },
  dotsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  dot: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  dotEmoji: { fontSize: 20 },
  balanceLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, marginTop: SPACING.sm, marginBottom: SPACING.lg },
  body: { alignSelf: 'stretch' },
  infoRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg, alignItems: 'flex-start' },
  infoIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.info + '1A',
    justifyContent: 'center', alignItems: 'center',
  },
  infoTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold },
  infoText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, lineHeight: 20, marginTop: 2 },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold,
    letterSpacing: 0.7, marginBottom: SPACING.sm, marginTop: SPACING.xs,
  },
  protectedGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  protectedRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  protectedEmoji: { fontSize: 16 },
  protectedDate: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm },
  closeBtn: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  closeBtnText: { color: '#fff', fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },
});
