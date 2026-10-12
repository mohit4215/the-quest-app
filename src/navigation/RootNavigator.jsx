/**
 * RootNavigator — Top-level stack navigator
 * Dark theme configuration for Quest app
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
        dark: true,
        colors: {
          primary: accentColor,
          background: Colors.background, // #0D0F14
          card: Colors.surface,          // #161922
          text: Colors.textPrimary,      // #F9FAFB
          border: Colors.border,         // #232838
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
