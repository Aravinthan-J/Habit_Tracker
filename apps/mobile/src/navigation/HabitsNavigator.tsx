/**
 * Habits Navigator
 * Stack navigator for habits management screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { AddEditHabitScreen } from '../screens/habits/AddEditHabitScreen';
import { colors } from '../constants/theme';

export type HabitsStackParamList = {
  HabitsList: undefined;
  AddEditHabit: { habitId?: string } | undefined;
};

const Stack = createStackNavigator<HabitsStackParamList>();

export function HabitsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="HabitsList"
        component={HabitsScreen}
        options={{ title: 'My Habits' }}
      />
      <Stack.Screen
        name="AddEditHabit"
        component={AddEditHabitScreen}
        options={({ route }) => ({
          title: route.params?.habitId ? 'Edit Habit' : 'New Habit',
        })}
      />
    </Stack.Navigator>
  );
}
