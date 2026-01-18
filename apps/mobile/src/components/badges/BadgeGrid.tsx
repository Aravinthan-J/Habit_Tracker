import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BadgeDefinition, BADGE_FILTERS } from '../../constants/badges';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: BadgeDefinition[];
  earnedBadges: Set<string>; // Set of earned badge names or IDs
  badgeProgress: Map<string, { current: number; total: number }>; // Progress for locked badges
  onBadgePress: (badge: BadgeDefinition) => void;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, earnedBadges, badgeProgress, onBadgePress }) => {
  const [activeFilter, setActiveFilter] = useState(BADGE_FILTERS[0].key);

  const filteredBadges = badges.filter(badge => {
    const isEarned = earnedBadges.has(badge.name);
    switch (activeFilter) {
      case 'all':
        return true;
      case 'earned':
        return isEarned;
      case 'locked':
        return !isEarned;
      case 'streak':
        return badge.category === 'Streaks';
      case 'completion':
        return badge.category === 'Completions';
      case 'step':
        return badge.category === 'Steps';
      case 'special':
        return badge.category === 'Time';
      default:
        return true;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {BADGE_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, activeFilter === filter.key && styles.activeFilter]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterText, activeFilter === filter.key && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredBadges}
        keyExtractor={item => item.name}
        numColumns={2}
        renderItem={({ item }) => {
          const isEarned = earnedBadges.has(item.name);
          const progress = !isEarned ? badgeProgress.get(item.name) : undefined;
          return (
            <BadgeCard
              badge={item}
              isEarned={isEarned}
              onPress={() => onBadgePress(item)}
              progress={progress}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
});

export default BadgeGrid;
