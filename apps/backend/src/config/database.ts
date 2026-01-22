/**
 * Database Configuration
 * Prisma client singleton
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma Client Instance
 * Uses singleton pattern to prevent multiple instances
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export { prisma };

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}
