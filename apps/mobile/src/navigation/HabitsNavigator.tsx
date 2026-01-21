import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HabitsStackParamList } from '../types/navigation.types';
import HabitsListScreen from '../screens/habits/HabitsListScreen';
import AddHabitScreen from '../screens/habits/AddHabitScreen';
import HabitDetailScreen from '../screens/habits/HabitDetailScreen';

const Stack = createStackNavigator<HabitsStackParamList>();

/**
 * Habits Stack Navigator
 * Nested in the Habits tab - Phase 1
 */
const HabitsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="HabitsList"
        component={HabitsListScreen}
        options={{ title: 'My Habits' }}
      />
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={({ route }) => ({
          title: route.params?.habit ? 'Edit Habit' : 'Add Habit',
        })}
      />
      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{ title: 'Habit Details' }}
      />
    </Stack.Navigator>
  );
};

export default HabitsNavigator;
