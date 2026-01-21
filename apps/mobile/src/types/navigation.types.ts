/**
 * Navigation type definitions for React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Auth Stack Navigator
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

/**
 * Main App Bottom Tab Navigator - Phase 1
 */
export type AppTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Habits: undefined;
  Settings: undefined;
};

export type AppTabScreenProps<T extends keyof AppTabParamList> =
  BottomTabScreenProps<AppTabParamList, T>;

/**
 * Habits Stack Navigator (nested in Habits tab)
 */
export type HabitsStackParamList = {
  HabitsList: undefined;
  AddHabit: { habit?: any } | undefined;
  HabitDetail: { habitId: string };
};

export type HabitsStackScreenProps<T extends keyof HabitsStackParamList> =
  StackScreenProps<HabitsStackParamList, T>;

/**
 * Root Navigator
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
