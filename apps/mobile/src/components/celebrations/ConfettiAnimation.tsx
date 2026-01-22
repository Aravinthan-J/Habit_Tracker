/**
 * Confetti Animation Component
 * Simple confetti effect for celebrations
 * Can be enhanced with Lottie animations later
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ConfettiParticle {
  id: number;
  x: number;
  y: Animated.Value;
  rotation: Animated.Value;
  size: number;
  color: string;
  delay: number;
}

interface ConfettiAnimationProps {
  visible: boolean;
  duration?: number;
}

const CONFETTI_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#FFD93D',
  '#6BCF7F',
  '#FF85A2',
];

export function ConfettiAnimation({ visible, duration = 2000 }: ConfettiAnimationProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (visible) {
      // Create 50 confetti particles
      const newParticles: ConfettiParticle[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: new Animated.Value(-20),
        rotation: new Animated.Value(0),
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: i * 20,
      }));

      setParticles(newParticles);

      // Animate each particle
      newParticles.forEach((particle) => {
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: 120,
            duration: duration + Math.random() * 1000,
            delay: particle.delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: Math.random() > 0.5 ? 360 : -360,
            duration: duration + Math.random() * 500,
            delay: particle.delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      setParticles([]);
    }
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: [
                {
                  translateY: particle.y.interpolate({
                    inputRange: [-20, 120],
                    outputRange: [-20, 120],
                  }),
                },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
