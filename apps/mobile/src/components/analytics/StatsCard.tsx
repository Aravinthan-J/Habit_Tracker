import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface StatsCardProps {
  label: string;
  value: string;
  iconName: string;
  percentageChange?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, iconName, percentageChange }) => {
  const isPositive = percentageChange && percentageChange >= 0;

  return (
    <View style={styles.card}>
      <Icon name={iconName} size={30} color="#6C63FF" />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {percentageChange !== undefined && (
        <View style={styles.changeContainer}>
          <Icon name={isPositive ? 'arrow-up' : 'arrow-down'} size={14} color={isPositive ? '#4CAF50' : '#F44336'} />
          <Text style={[styles.changeText, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
            {Math.abs(percentageChange).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  changeText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default StatsCard;
