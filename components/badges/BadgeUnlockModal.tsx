import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { BadgeWithStatus } from '@/types/badge.types';
import { TIER_COLORS } from '@/constants/badges';
import { ConfettiAnimation } from './ConfettiAnimation';
import { useHaptics } from '@/hooks/useHaptics';

interface BadgeUnlockModalProps {
  badge: BadgeWithStatus | null;
  visible: boolean;
  onClose: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badge,
  visible,
  onClose,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { success } = useHaptics();

  React.useEffect(() => {
    if (visible) success();
  }, [visible]);

  if (!badge) return null;
  const tierColor = TIER_COLORS[badge.tier];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        {visible && <ConfettiAnimation onFinish={() => {}} />}
        <View style={styles.container}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.card]}
            style={styles.modal}
          >
            <View style={[styles.iconRing, { borderColor: tierColor }]}>
              <Text style={styles.badgeEmoji}>🏆</Text>
            </View>
            <Text style={styles.newBadge}>New Badge Unlocked!</Text>
            <Text style={[styles.badgeName, { color: tierColor }]}>{badge.name}</Text>
            <Text style={styles.description}>{badge.description}</Text>

            <View style={[styles.tierChip, { backgroundColor: tierColor + '33' }]}>
              <Ionicons name="star" size={12} color={tierColor} style={{ marginRight: 4 }} />
              <Text style={[styles.tierText, { color: tierColor }]}>
                {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)} Badge
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: tierColor }]}
              accessibilityLabel="Claim badge"
            >
              <Text style={styles.buttonText}>Claim Badge! 🎉</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { width: '85%', maxWidth: 360 },
  modal: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  badgeEmoji: { fontSize: 48 },
  newBadge: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  tierText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold },
  button: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
});
