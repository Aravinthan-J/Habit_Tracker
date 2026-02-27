import React, { useRef, useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { COLORS } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 60;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const CONFETTI_COLORS = [
  COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.accentOrange,
  COLORS.gold, '#FF6584', '#43CFBA', '#F59E0B',
];

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

export const ConfettiAnimation: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(randomBetween(0, SCREEN_WIDTH)),
      y: new Animated.Value(-40),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: randomBetween(6, 14),
    }))
  ).current;

  useEffect(() => {
    const animations = particles.map((p, i) => {
      const delay = i * 30;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: SCREEN_HEIGHT + 40,
            duration: randomBetween(1200, 2200),
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: p.x.__getValue() + randomBetween(-80, 80),
            duration: randomBetween(1200, 2200),
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: randomBetween(4, 8),
            duration: randomBetween(1200, 2200),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(randomBetween(900, 1500)),
            Animated.timing(p.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => onFinish?.());
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size * 0.5,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 2,
  },
});
