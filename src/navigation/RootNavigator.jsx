/**
 * RootNavigator — Top-level stack navigator
 * Light theme configuration for Quest app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import { Colors } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { accentColor } = useQuestMode();

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: accentColor,
          background: Colors.background, // #FFFFFF
          card: Colors.surface,          // #FFFFFF
          text: Colors.textPrimary,      // #0F172A
          border: Colors.border,         // #E2E8F0
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
