import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { colors, spacing, typography } from '../../constants/theme';

interface TodayStatsCardProps {
  completed: number;
  total: number;
}

const TodayStatsCard: React.FC<TodayStatsCardProps> = ({ completed, total }) => {
  const progress = total > 0 ? completed / total : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <Progress.Circle
        size={80}
        progress={progress}
        showsText={true}
        formatText={() => `${percentage}%`}
        color={colors.primary}
        unfilledColor={colors.gray_light}
        borderColor={colors.white}
        textStyle={styles.progressText}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Today's Progress</Text>
        <Text style={styles.subtitle}>{`${completed} of ${total} habits completed`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  textContainer: {
    marginLeft: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text_secondary,
  },
});

export default TodayStatsCard;
