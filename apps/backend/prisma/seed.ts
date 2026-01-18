import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed the database with initial test data
 */
async function main() {
  console.log('Starting database seeding...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('Test1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      stepGoal: 10000,
      reminderTime: '09:00',
      timezone: 'America/New_York',
      theme: 'light',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log(`Created test user: ${user.email}`);

  // Create sample habits
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Morning Exercise',
        monthlyGoal: 25,
        color: '#FF5722',
        icon: 'fitness',
        notificationsEnabled: true,
        reminderTime: '07:00',
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Read for 30 minutes',
        monthlyGoal: 20,
        color: '#2196F3',
        icon: 'book',
        notificationsEnabled: true,
        reminderTime: '20:00',
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Meditate',
        monthlyGoal: 30,
        color: '#9C27B0',
        icon: 'spa',
        notificationsEnabled: true,
        reminderTime: '06:30',
      },
    }),
  ]);

  console.log(`Created ${habits.length} sample habits`);

  // Create some sample completions for the current month
  const today = new Date();
  const completions = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Add completions for random habits
    for (const habit of habits) {
      if (Math.random() > 0.3) { // 70% chance of completion
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
  }

  await Promise.all(completions);
  console.log(`Created ${completions.length} sample completions`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
