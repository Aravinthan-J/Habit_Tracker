import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface InsightCardProps {
  message: string;
  type: 'positive' | 'negative' | 'neutral';
}

const InsightCard: React.FC<InsightCardProps> = ({ message, type }) => {
  const iconMap = {
    positive: 'trending-up-outline',
    negative: 'trending-down-outline',
    neutral: 'information-circle-outline',
  };

  const colorMap = {
    positive: '#4CAF50',
    negative: '#F44336',
    neutral: '#6C63FF',
  };

  return (
    <View style={[styles.card, { borderColor: colorMap[type] }]}>
      <Icon name={iconMap[type]} size={24} color={colorMap[type]} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: 15,
  },
  message: {
    fontSize: 15,
    color: '#333',
    flex: 1, // Ensure text wraps correctly
  },
});

export default InsightCard;
