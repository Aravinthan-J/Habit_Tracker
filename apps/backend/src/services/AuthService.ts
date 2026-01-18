import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/AppError';
import { TokenService } from './TokenService';
import { AuthResponse, SafeUser } from '../types';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

const BCRYPT_ROUNDS = 10;

/**
 * Service for handling authentication operations
 */
export class AuthService {
  /**
   * Register a new user
   *
   * @param data - Registration data
   * @returns User and authentication token
   * @throws ConflictError if email already exists
   */
  static async register(data: RegisterInput): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        stepGoal: true,
        reminderTime: true,
        timezone: true,
        theme: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const token = TokenService.generateToken(user.id, user.email);
    const refreshToken = TokenService.generateRefreshToken(user.id, user.email);

    return {
      user,
      token,
      refreshToken,
    };
  }

  /**
   * Login user with email and password
   *
   * @param data - Login credentials
   * @returns User and authentication token
   * @throws UnauthorizedError if credentials are invalid
   */
  static async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Remove password from response
    const { password: _, ...safeUser } = user;

    // Generate tokens
    const token = TokenService.generateToken(user.id, user.email);
    const refreshToken = TokenService.generateRefreshToken(user.id, user.email);

    return {
      user: safeUser,
      token,
      refreshToken,
    };
  }

  /**
   * Get current user by ID
   *
   * @param userId - User ID
   * @returns User data
   * @throws NotFoundError if user not found
   */
  static async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        stepGoal: true,
        reminderTime: true,
        timezone: true,
        theme: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Update user profile preferences
   *
   * @param userId - User ID
   * @param data - Profile update data
   * @returns Updated user data
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        stepGoal: true,
        reminderTime: true,
        timezone: true,
        theme: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Change user password
   *
   * @param userId - User ID
   * @param data - Password change data
   * @throws UnauthorizedError if current password is incorrect
   */
  static async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
