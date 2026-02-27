import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

const SkeletonLine: React.FC<{ width?: number | string; height?: number; style?: any }> = ({
  width = '100%',
  height = 16,
  style,
}) => {
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: COLORS.surfaceLight,
          borderRadius: RADIUS.sm,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const LoadingState: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View style={styles.container}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.card}>
        <View style={styles.row}>
          <SkeletonLine width={44} height={44} style={{ borderRadius: 22 }} />
          <View style={styles.textBlock}>
            <SkeletonLine width="60%" height={18} />
            <SkeletonLine width="40%" height={12} style={{ marginTop: SPACING.xs }} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  textBlock: { flex: 1, marginLeft: SPACING.md },
});
