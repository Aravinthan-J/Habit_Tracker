/**
 * Theme Context
 * Provides theme state and toggle functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api/apiClient';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: typeof lightColors;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const { user } = useAuthStore();
  const [theme, setThemeState] = useState<Theme>('system');

  // Determine active color scheme based on theme setting
  const getColorScheme = (): ColorScheme => {
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  };

  const colorScheme = getColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  // Load user's theme preference on mount
  useEffect(() => {
    if (user?.theme) {
      setThemeState(user.theme as Theme);
    }
  }, [user?.theme]);

  // Update theme and save to backend
  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);

      // Save to backend (API only supports 'light' or 'dark', not 'system')
      if (user) {
        const apiTheme = newTheme === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : newTheme;
        await api.auth.updateProfile({ theme: apiTheme });
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Revert on error
      setThemeState(theme);
      throw error;
    }
  };

  // Toggle between light and dark
  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, colorScheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
