import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { TIER_COLORS } from '../../constants/badges';
import { BadgeTier } from '../../constants/badges';

interface BadgeProgressBarProps {
  current: number;
  total: number;
  tier: BadgeTier;
  label?: string;
}

const BadgeProgressBar: React.FC<BadgeProgressBarProps> = ({ current, total, tier, label }) => {
  const progress = total > 0 ? current / total : 0;
  const progressColor = TIER_COLORS[tier]?.primary || '#6C63FF'; // Default color

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {label && <Text style={styles.labelText}>{label}</Text>}
        <Text style={styles.progressText}>{`${current}/${total}`}</Text>
      </View>
      <Progress.Bar
        progress={progress}
        width={null} // Takes full width
        height={10}
        borderRadius={5}
        color={progressColor}
        unfilledColor="#e0e0e0"
        borderWidth={0}
        style={styles.progressBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  progressBar: {
    // Add any specific styling for the bar itself if needed
  },
});

export default BadgeProgressBar;
