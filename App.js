/**
 * Quest App — Root Entry Point
 *
 * Bootstraps:
 *  - SafeAreaProvider (safe area insets for all screens)
 *  - QuestModeProvider (Lazy Mode vs Quester Mode state & user hostel data)
 *  - RootNavigator (NavigationContainer + Dark themed 4-tab shell)
 *  - StatusBar (Dark theme configuration)
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
        <StatusBar style="light" backgroundColor="#0D0F14" translucent={false} />
        <RootNavigator />
      </QuestModeProvider>
    </SafeAreaProvider>
  );
}
