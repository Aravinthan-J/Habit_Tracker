import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: 'checkbox-outline' as const,
    title: 'Track Daily Habits',
    body: 'Build powerful routines by tracking your habits every day. Every check-in matters.',
    gradient: ['#6C63FF', '#4D44DB'] as const,
  },
  {
    key: '2',
    icon: 'flame-outline' as const,
    title: 'Build Streaks',
    body: 'Keep your momentum going! Streaks motivate you to stay consistent and build lasting habits.',
    gradient: ['#FF6584', '#FF9A3C'] as const,
  },
  {
    key: '3',
    icon: 'trophy-outline' as const,
    title: 'Earn Badges',
    body: 'Unlock 30+ achievement badges as you reach milestones. Celebrate your progress!',
    gradient: ['#FFD700', '#FF9A3C'] as const,
  },
  {
    key: '4',
    icon: 'footsteps-outline' as const,
    title: 'Track Your Steps',
    body: 'Your phone\'s pedometer tracks every step. Hit daily goals and earn step-based badges.',
    gradient: ['#43CFBA', '#6C63FF'] as const,
  },
];

export default function OnboardingScreen() {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const router = useRouter();

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const skip = () => router.replace('/(tabs)');

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient colors={item.gradient as any} style={styles.iconCircle}>
              <Ionicons name={item.icon} size={56} color={COLORS.textPrimary} />
            </LinearGradient>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        {index < SLIDES.length - 1 && (
          <TouchableOpacity onPress={skip} accessibilityLabel="Skip onboarding">
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
        <Button
          title={index === SLIDES.length - 1 ? 'Get Started! 🎯' : 'Next'}
          onPress={goNext}
          style={styles.nextBtn}
          accessibilityLabel={index === SLIDES.length - 1 ? 'Get started' : 'Next slide'}
        />
      </View>
    </View>
  );
}

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  slideTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  slideBody: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.lg,
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.surfaceLight },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
  },
  skip: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.md },
  nextBtn: { flex: 1 },
});
