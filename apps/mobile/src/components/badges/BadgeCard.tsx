import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BadgeDefinition, TIER_COLORS } from '../../constants/badges';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

interface BadgeCardProps {
  badge: BadgeDefinition;
  isEarned: boolean;
  onPress: () => void;
  progress?: { current: number; total: number };
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isEarned, onPress, progress }) => {
  const tierColor = TIER_COLORS[badge.tier];

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={[tierColor.primary, tierColor.secondary]}
        style={[styles.card, !isEarned && styles.lockedCard]}
      >
        <View style={[styles.glow, { shadowColor: tierColor.glow }]}>
          <Icon name={badge.iconName} size={48} color={isEarned ? '#fff' : '#ccc'} />
        </View>
        <Text style={[styles.badgeName, !isEarned && styles.lockedText]} numberOfLines={2}>
          {badge.name}
        </Text>
        {isEarned && <Text style={styles.earnedText}>Earned</Text>}
        {!isEarned && progress && (
          <Text style={styles.progressText}>{`${progress.current} / ${progress.total}`}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  lockedCard: {
    opacity: 0.7,
  },
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  badgeName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  lockedText: {
    color: '#eee',
  },
  earnedText: {
    marginTop: 4,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BadgeCard;
