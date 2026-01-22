/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */

import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { prisma } from '../config/database';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/AppError';
import { TokenService } from './TokenService';

const SALT_ROUNDS = 10;

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface UpdateProfileData {
  name?: string;
  stepGoal?: number;
  reminderTime?: string;
  timezone?: string;
  theme?: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name || null,
      },
    });

    // Create sample habits for new user
    await this.createSampleHabits(user.id);

    // Generate token
    const token = TokenService.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Create sample habits for new users
   */
  private static async createSampleHabits(userId: string): Promise<void> {
    const sampleHabits = [
      {
        userId,
        title: 'Morning Workout',
        monthlyGoal: 20,
        color: '#6C63FF',
        icon: '💪',
      },
      {
        userId,
        title: 'Read 30 Minutes',
        monthlyGoal: 25,
        color: '#48BB78',
        icon: '📚',
      },
      {
        userId,
        title: 'Drink Water',
        monthlyGoal: 30,
        color: '#4299E1',
        icon: '💧',
      },
      {
        userId,
        title: 'Meditation',
        monthlyGoal: 20,
        color: '#9F7AEA',
        icon: '🧘',
      },
      {
        userId,
        title: 'Sleep 8 Hours',
        monthlyGoal: 25,
        color: '#ED8936',
        icon: '🛌',
      },
    ];

    await prisma.habit.createMany({
      data: sampleHabits,
    });
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = TokenService.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
