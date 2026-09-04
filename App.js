/**
 * Quest App — Root Entry Point
 *
 * Bootstraps:
 *  - SafeAreaProvider (safe area insets for all screens)
 *  - RootNavigator (NavigationContainer + tabs)
 *  - StatusBar configuration
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
