import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface StepStatsProps {
  distance: number; // in meters
  calories: number;
  activeMinutes: number;
}

const StepStats: React.FC<StepStatsProps> = ({ distance, calories, activeMinutes }) => {
  const formatDistance = (d: number) => {
    if (d < 1000) {
      return `${d.toFixed(0)} m`;
    }
    return `${(d / 1000).toFixed(2)} km`;
  };
  
  return (
    <View style={styles.statsContainer}>
      <View style={styles.stat}>
        <Icon name="walk-outline" size={24} color="#6C63FF" />
        <Text style={styles.statValue}>{formatDistance(distance)}</Text>
        <Text style={styles.statLabel}>Distance</Text>
      </View>
      <View style={styles.stat}>
        <Icon name="flame-outline" size={24} color="#FF6B6B" />
        <Text style={styles.statValue}>{calories.toFixed(0)}</Text>
        <Text style={styles.statLabel}>Calories</Text>
      </View>
      <View style={styles.stat}>
        <Icon name="timer-outline" size={24} color="#4ECDC4" />
        <Text style={styles.statValue}>{activeMinutes}</Text>
        <Text style={styles.statLabel}>Active Mins</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default StepStats;
