/**
 * Main Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { HabitsNavigator } from './HabitsNavigator';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { BadgesScreen } from '../screens/badges/BadgesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { colors } from '../constants/theme';
import { HomeIcon } from './icons/HomeIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { ListIcon } from './icons/ListIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { SettingsIcon } from './icons/SettingsIcon';

export type MainTabParamList = {
  HomeTab: undefined;
  Calendar: undefined;
  Analytics: undefined;
  HabitsTab: undefined;
  Badges: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Today',
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <BarChartIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HabitsTab"
        component={HabitsNavigator}
        options={{
          title: 'Habits',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <ListIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Badges"
        component={BadgesScreen}
        options={{
          title: 'Badges',
          tabBarIcon: ({ color, size }) => (
            <TrophyIcon size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
