import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppTabParamList } from '../types/navigation.types';
import HomeScreen from '../screens/home/HomeScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import HabitsNavigator from './HabitsNavigator';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import BadgesScreen from '../screens/badges/BadgesScreen';
import StepsScreen from '../screens/steps/StepsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { colors, typography } from '../constants/theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Bottom Tab Navigator
 * Main app navigation with Home, Calendar, Habits, and Settings tabs
 */
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-month" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsNavigator}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <Icon name="format-list-checks" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Badges"
        component={BadgesScreen}
        options={{
          tabBarLabel: 'Badges',
          tabBarIcon: ({ color, size }) => (
            <Icon name="trophy" size={size} color={color} />
          ),
        }}
      />
       <Tab.Screen
        name="Steps"
        component={StepsScreen}
        options={{
          tabBarLabel: 'Steps',
          tabBarIcon: ({ color, size }) => (
            <Icon name="walk" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
