import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@habit-tracker/shared-types';

/**
 * Keys for AsyncStorage
 */
const KEYS = {
  AUTH_TOKEN: '@habit_tracker:auth_token',
  REFRESH_TOKEN: '@habit_tracker:refresh_token',
  USER_DATA: '@habit_tracker:user_data',
} as const;

/**
 * Secure storage service for sensitive data
 * Uses AsyncStorage (consider @react-native-keychain for production)
 */
export class SecureStorageService {
  /**
   * Save authentication token
   */
  static async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  /**
   * Get authentication token
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Remove authentication token
   */
  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  /**
   * Save refresh token
   */
  static async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Save user data
   */
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  /**
   * Get user data
   */
  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Remove user data
   */
  static async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  /**
   * Clear all stored data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.AUTH_TOKEN,
        KEYS.REFRESH_TOKEN,
        KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}
