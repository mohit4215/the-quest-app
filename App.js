/**
 * Quest App — Root Entry Point
 *
 * Bootstraps:
 *  - SafeAreaProvider (safe area insets for all screens)
 *  - QuestModeProvider (Lazy Mode vs Quester Mode state & user hostel data)
 *  - RootNavigator (NavigationContainer + White themed 3-tab shell)
 *  - StatusBar (Light theme configuration)
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QuestModeProvider } from './src/context/QuestModeContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <QuestModeProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
        <RootNavigator />
      </QuestModeProvider>
    </SafeAreaProvider>
  );
}
