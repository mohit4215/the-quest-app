/**
 * TabNavigator — Bottom tab bar for Quest app
 * 5 tabs: Home, Do a Quest, Post a Quest, Rewards, Forum
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout, Shadow } from '../constants';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DoQuestScreen from '../screens/DoQuestScreen';
import PostQuestScreen from '../screens/PostQuestScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ForumScreen from '../screens/ForumScreen';

const Tab = createBottomTabNavigator();

// Tab config
const TABS = [
  {
    name: 'Home',
    component: HomeScreen,
    icon: '🏠',
    activeIcon: '🏠',
    label: 'Home',
  },
  {
    name: 'DoQuest',
    component: DoQuestScreen,
    icon: '🗺️',
    activeIcon: '🗺️',
    label: 'Do Quest',
  },
  {
    name: 'PostQuest',
    component: PostQuestScreen,
    icon: '➕',
    activeIcon: '➕',
    label: 'Post Quest',
    isFAB: true, // center FAB-style tab
  },
  {
    name: 'Rewards',
    component: RewardsScreen,
    icon: '🏆',
    activeIcon: '🏆',
    label: 'Rewards',
  },
  {
    name: 'Forum',
    component: ForumScreen,
    icon: '💬',
    activeIcon: '💬',
    label: 'Forum',
  },
];

function TabIcon({ icon, label, focused, isFAB }) {
  if (isFAB) {
    return (
      <View style={[styles.fab, focused && styles.fabActive]}>
        <Text style={styles.fabIcon}>➕</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.activePill} />}
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: Layout.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarShowLabel: false,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={focused ? tab.activeIcon : tab.icon}
                label={tab.label}
                focused={focused}
                isFAB={tab.isFAB}
              />
            ),
            tabBarItemStyle: tab.isFAB ? styles.fabTabItem : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
    minWidth: 56,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.tabInactive,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.tabActive,
    fontWeight: '700',
  },
  activePill: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  // FAB center tab
  fabTabItem: {
    marginTop: -20,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  fabActive: {
    backgroundColor: Colors.primaryDark,
  },
  fabIcon: {
    fontSize: 22,
    color: Colors.textInverse,
  },
});
