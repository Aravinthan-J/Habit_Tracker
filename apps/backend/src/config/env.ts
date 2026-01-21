/**
 * Environment Configuration
 * Centralizes all environment variable access with validation
 */

import { config } from 'dotenv';

// Load environment variables
config();

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRY: string;

  // CORS
  CORS_ORIGIN: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

/**
 * Validates and returns environment configuration
 */
function getEnvConfig(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8081',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  };
}

export const env = getEnvConfig();
