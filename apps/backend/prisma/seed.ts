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
