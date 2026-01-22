/**
 * Badge Unlock Modal
 * Celebration modal when a badge is unlocked
 */

import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BADGE_ICONS, TIER_COLORS } from '../../constants/badges';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface Badge {
  id: string;
  name: string;
  description: string;
  type: string;
  tier: string;
  requirement: number;
  iconName: string;
}

interface BadgeUnlockModalProps {
  visible: boolean;
  badge: Badge | null;
  message?: string;
  onClose: () => void;
  onShare?: () => void;
  onViewCollection?: () => void;
}

export function BadgeUnlockModal({
  visible,
  badge,
  message,
  onClose,
  onShare,
  onViewCollection,
}: BadgeUnlockModalProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  // Trigger haptic and animation on show
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!badge) return null;

  const tierColor = TIER_COLORS[badge.tier as keyof typeof TIER_COLORS];
  const icon = BADGE_ICONS[badge.iconName];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Badge Icon with glow */}
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.glowCircle,
                { backgroundColor: tierColor + '40' },
              ]}
            />
            <Text style={styles.badgeIcon}>{icon}</Text>
          </View>

          {/* Congratulations Text */}
          <Text style={styles.congratsText}>Congratulations!</Text>
          <Text style={styles.unlockText}>Badge Unlocked!</Text>

          {/* Badge Details */}
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{message || badge.description}</Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.tierText}>{badge.tier.toUpperCase()}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttons}>
            {onShare && (
              <TouchableOpacity style={styles.button} onPress={onShare}>
                <Text style={styles.buttonText}>Share 📱</Text>
              </TouchableOpacity>
            )}

            {onViewCollection && (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => {
                  onViewCollection();
                  onClose();
                }}
              >
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                  View Collection
                </Text>
              </TouchableOpacity>
            )}

            {!onShare && !onViewCollection && (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                  Awesome!
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Close hint */}
          <Text style={styles.closeHint}>Tap anywhere to close</Text>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  badgeIcon: {
    fontSize: 80,
  },
  congratsText: {
    fontSize: typography.fontSize.xxxl - 4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  unlockText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  badgeName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  tierBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  tierText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  closeHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});
