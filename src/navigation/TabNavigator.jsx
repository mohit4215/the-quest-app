/**
 * TabNavigator — Bottom navigation bar for "Quest"
 * 4 tabs: Home Feed, Active Quest, Senior Connect, and Leaderboard
 * Dark theme (#0D0F14 background, #161922 card surface)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';

// 4 Screens
import HomeFeedScreen from '../screens/HomeFeedScreen';
import ActiveQuestScreen from '../screens/ActiveQuestScreen';
import SeniorConnectScreen from '../screens/SeniorConnectScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  {
    name: 'HomeFeed',
    component: HomeFeedScreen,
    icon: '🏠',
    label: 'Home Feed',
  },
  {
    name: 'ActiveQuest',
    component: ActiveQuestScreen,
    icon: '⚔️',
    label: 'Active Quest',
  },
  {
    name: 'SeniorConnect',
    component: SeniorConnectScreen,
    icon: '🎓',
    label: 'Senior Connect',
  },
  {
    name: 'Leaderboard',
    component: LeaderboardScreen,
    icon: '🏆',
    label: 'Leaderboard',
  },
];

function TabIcon({ icon, label, focused, activeColor }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
        {icon}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          focused && { color: activeColor, fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
      {focused && (
        <View style={[styles.activePill, { backgroundColor: activeColor }]} />
      )}
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { accentColor } = useQuestMode();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
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
                icon={tab.icon}
                label={tab.label}
                focused={focused}
                activeColor={accentColor}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#12151E', // Dark navigation surface
    borderTopWidth: 1,
    borderTopColor: '#202636',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 2,
    minWidth: 72,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  activePill: {
    position: 'absolute',
    bottom: -6,
    width: 22,
    height: 3,
    borderRadius: Radius.full,
  },
});
