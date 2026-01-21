/**
 * Express Application Setup
 * Configures middleware and routes
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

/**
 * Create and configure Express app
 */
export function createApp(): Express {
  const app = express();

  /**
   * Security Middleware
   */
  // Helmet - sets various HTTP headers for security
  app.use(helmet());

  // CORS - allow cross-origin requests
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  /**
   * Rate Limiting
   */
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to all API routes
  app.use('/api', limiter);

  /**
   * Body Parsing Middleware
   */
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  /**
   * Routes
   */
  app.use('/api', routes);

  /**
   * Root endpoint
   */
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Habit Tracker API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        habits: '/api/habits',
        completions: '/api/completions',
      },
    });
  });

  /**
   * Error Handling
   */
  // Handle 404 routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
