/**
 * Database Seed Script
 * Creates test data for development
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('Test1234', 10);

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      stepGoal: 10000,
      reminderTime: '20:00',
      timezone: 'UTC',
      theme: 'light',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create test habits
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Morning Workout',
        monthlyGoal: 20,
        color: '#6C63FF',
        icon: '💪',
        notificationsEnabled: true,
        reminderTime: '07:00',
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Read 30 Minutes',
        monthlyGoal: 25,
        color: '#48BB78',
        icon: '📚',
        notificationsEnabled: true,
        reminderTime: '21:00',
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Meditation',
        monthlyGoal: 30,
        color: '#9F7AEA',
        icon: '🧘',
        notificationsEnabled: true,
        reminderTime: '08:00',
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Drink Water (8 glasses)',
        monthlyGoal: 31,
        color: '#4299E1',
        icon: '💧',
        notificationsEnabled: false,
      },
    }),
  ]);

  console.log(`✅ Created ${habits.length} test habits`);

  // Create some completions for the last 10 days
  const today = new Date();
  const completions = [];

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Complete 2-3 random habits per day
    const habitsToComplete = habits.slice(0, Math.floor(Math.random() * 2) + 2);

    for (const habit of habitsToComplete) {
      completions.push(
        prisma.completion.create({
          data: {
            habitId: habit.id,
            userId: user.id,
            date: date,
          },
        })
      );
    }
  }

  await Promise.all(completions);
  console.log(`✅ Created ${completions.length} test completions`);

  // Create badges
  const badges = [
    // STREAK BADGES (4 badges)
    {
      name: '21-Day Warrior',
      description: 'Complete any habit for 21 consecutive days',
      type: 'streak',
      tier: 'bronze',
      requirement: 21,
      iconName: 'fire-bronze'
    },
    {
      name: '45-Day Champion',
      description: 'Complete any habit for 45 consecutive days',
      type: 'streak',
      tier: 'silver',
      requirement: 45,
      iconName: 'fire-silver'
    },
    {
      name: '100-Day Legend',
      description: 'Complete any habit for 100 consecutive days',
      type: 'streak',
      tier: 'gold',
      requirement: 100,
      iconName: 'fire-gold'
    },
    {
      name: '365-Day Master',
      description: 'Complete any habit for an entire year',
      type: 'streak',
      tier: 'platinum',
      requirement: 365,
      iconName: 'fire-platinum'
    },

    // COMPLETION BADGES (5 badges)
    {
      name: 'Perfect Week',
      description: 'Complete all active habits for 7 consecutive days',
      type: 'completion',
      tier: 'bronze',
      requirement: 7,
      iconName: 'calendar-check'
    },
    {
      name: 'Perfect Month',
      description: 'Achieve monthly goal for all habits in one month',
      type: 'completion',
      tier: 'silver',
      requirement: 1,
      iconName: 'calendar-star'
    },
    {
      name: 'Comeback Kid',
      description: 'Restart a habit within 3 days of breaking a streak',
      type: 'completion',
      tier: 'bronze',
      requirement: 1,
      iconName: 'refresh'
    },
    {
      name: 'Early Bird',
      description: 'Complete 7 check-ins before 9 AM',
      type: 'completion',
      tier: 'bronze',
      requirement: 7,
      iconName: 'sunrise'
    },
    {
      name: 'Night Owl',
      description: 'Complete 7 check-ins after 9 PM',
      type: 'completion',
      tier: 'bronze',
      requirement: 7,
      iconName: 'moon'
    },

    // VOLUME BADGES (4 badges)
    {
      name: '100 Completions Club',
      description: 'Total 100 habit completions across all habits',
      type: 'volume',
      tier: 'bronze',
      requirement: 100,
      iconName: 'trophy-bronze'
    },
    {
      name: '500 Completions Club',
      description: 'Total 500 habit completions',
      type: 'volume',
      tier: 'silver',
      requirement: 500,
      iconName: 'trophy-silver'
    },
    {
      name: '1000 Completions Club',
      description: 'Total 1000 habit completions',
      type: 'volume',
      tier: 'gold',
      requirement: 1000,
      iconName: 'trophy-gold'
    },
    {
      name: '5000 Completions Club',
      description: 'Total 5000 habit completions',
      type: 'volume',
      tier: 'platinum',
      requirement: 5000,
      iconName: 'trophy-platinum'
    },

    // STEP BADGES (8 badges)
    {
      name: '10K Walker',
      description: 'Hit 10,000 steps in a single day',
      type: 'step',
      tier: 'bronze',
      requirement: 10000,
      iconName: 'walk'
    },
    {
      name: 'Marathon Month',
      description: 'Average 10,000+ steps for 30 consecutive days',
      type: 'step',
      tier: 'silver',
      requirement: 30,
      iconName: 'run'
    },
    {
      name: 'Step Streak - Week',
      description: '7 consecutive days hitting step goal',
      type: 'step',
      tier: 'bronze',
      requirement: 7,
      iconName: 'footsteps-bronze'
    },
    {
      name: 'Step Streak - 2 Weeks',
      description: '14 consecutive days hitting step goal',
      type: 'step',
      tier: 'silver',
      requirement: 14,
      iconName: 'footsteps-silver'
    },
    {
      name: 'Step Streak - Month',
      description: '30 consecutive days hitting step goal',
      type: 'step',
      tier: 'gold',
      requirement: 30,
      iconName: 'footsteps-gold'
    },
    {
      name: '100km Milestone',
      description: 'Walk 100 kilometers total',
      type: 'step',
      tier: 'bronze',
      requirement: 100,
      iconName: 'map-bronze'
    },
    {
      name: '500km Milestone',
      description: 'Walk 500 kilometers total',
      type: 'step',
      tier: 'silver',
      requirement: 500,
      iconName: 'map-silver'
    },
    {
      name: '1000km Milestone',
      description: 'Walk 1000 kilometers total',
      type: 'step',
      tier: 'gold',
      requirement: 1000,
      iconName: 'map-gold'
    },

    // SPECIAL BADGES (9 badges)
    {
      name: 'Habit Collector',
      description: 'Create 10 different habits',
      type: 'special',
      tier: 'bronze',
      requirement: 10,
      iconName: 'collection'
    },
    {
      name: 'Weekend Warrior',
      description: 'Complete all habits on 4 consecutive weekends',
      type: 'special',
      tier: 'silver',
      requirement: 4,
      iconName: 'weekend'
    },
    {
      name: 'Consistency King',
      description: 'Maintain at least one active habit for 180 days',
      type: 'special',
      tier: 'gold',
      requirement: 180,
      iconName: 'crown'
    },
    {
      name: 'Morning Person',
      description: 'Complete habits before 10 AM for 14 consecutive days',
      type: 'special',
      tier: 'bronze',
      requirement: 14,
      iconName: 'sun'
    },
    {
      name: 'Variety Champion',
      description: 'Have 5 different habits active simultaneously',
      type: 'special',
      tier: 'bronze',
      requirement: 5,
      iconName: 'rainbow'
    },
    {
      name: 'Month Master',
      description: 'Complete all habits for an entire calendar month',
      type: 'special',
      tier: 'gold',
      requirement: 1,
      iconName: 'star-gold'
    },
    {
      name: 'Rapid Starter',
      description: 'Complete a habit within 1 hour of creating it',
      type: 'special',
      tier: 'bronze',
      requirement: 1,
      iconName: 'lightning'
    },
    {
      name: 'Dedicated',
      description: 'Log in and check habits for 30 consecutive days',
      type: 'special',
      tier: 'silver',
      requirement: 30,
      iconName: 'medal'
    },
    {
      name: 'Perfectionist',
      description: 'Complete every habit you created without missing any',
      type: 'special',
      tier: 'platinum',
      requirement: 1,
      iconName: 'gem'
    },
  ];

  const badgePromises = badges.map(badge =>
    prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  );

  await Promise.all(badgePromises);
  console.log(`✅ Created ${badges.length} badges`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: Test1234');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
