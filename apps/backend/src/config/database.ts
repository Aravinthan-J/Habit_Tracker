import { PrismaClient } from '@prisma/client';
import { config } from './env';

/**
 * Prisma Client singleton instance
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Global Prisma client instance
 * Prevents multiple instances in development due to hot reloading
 */
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (config.isDevelopment) {
  globalThis.prisma = prisma;
}

/**
 * Connect to database and handle connection lifecycle
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Gracefully disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('👋 Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};
