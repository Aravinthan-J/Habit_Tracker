import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { BadgeDefinition, TIER_COLORS } from '../../constants/badges';
import ConfettiAnimation from './ConfettiAnimation';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface BadgeUnlockModalProps {
  badge: BadgeDefinition | null;
  visible: boolean;
  onClose: () => void;
}

const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ badge, visible, onClose }) => {
  useEffect(() => {
    if (visible && badge) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible, badge]);

  const onShare = async () => {
    if (!badge) return;
    try {
      await Share.share({
        message: `I just unlocked the "${badge.name}" badge in my Habit Tracker!`,
        title: 'New Achievement!',
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!badge) {
    return null;
  }

  const tierColor = TIER_COLORS[badge.tier];

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <ConfettiAnimation isVisible={visible} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Congratulations! Badge Unlocked!</Text>
          <View style={[styles.badgeIconContainer, { backgroundColor: tierColor.glow }]}>
            <Icon name={badge.iconName} size={100} color={tierColor.primary} />
          </View>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
          <Text style={styles.rarityText}>Earned by 5% of users</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={onShare}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>View Collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  contentContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  badgeIconContainer: {
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  badgeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badgeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  rarityText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  shareButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BadgeUnlockModal;
