/**
 * Secure Storage Service
 * Handles secure storage of tokens and user data using Expo SecureStore
 */

import * as SecureStore from 'expo-secure-store';
import type { User } from '@habit-tracker/shared-types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export class SecureStorageService {
  /**
   * Save auth token
   */
  static async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  /**
   * Get auth token
   */
  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Remove auth token
   */
  static async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Save user data
   */
  static async saveUser(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
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
      const userData = await SecureStore.getItemAsync(USER_KEY);
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
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  /**
   * Clear all auth data
   */
  static async clearAll(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeUser()]);
  }
}
