/**
 * RootNavigator — Top-level stack navigator
 * Stack wraps the tab bar to allow modal/push screens (e.g. QuestDetail, SeniorChat).
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import { Colors } from '../constants';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.textPrimary,
          border: Colors.border,
          notification: Colors.error,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Main tab shell */}
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
