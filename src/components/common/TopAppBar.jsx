/**
 * TopAppBar — Header component for "Quest"
 * Features:
 * 1. User Hostel badge ("BH-2 • Room 214")
 * 2. Gold pill badge showing "450 QP" (Quest Points)
 * 3. Toggle switch to flip between "Lazy Mode" (Purple #7C3AED) and "Quester Mode" (Green #10B981)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';
import QPBadge from './QPBadge';

export default function TopAppBar({
  hostelBadge: propHostelBadge,
  qpBalance: propQpBalance,
}) {
  const insets = useSafeAreaInsets();
  const {
    mode,
    toggleMode,
    setMode,
    isLazyMode,
    isQuesterMode,
    userProfile,
  } = useQuestMode();

  const hostelText = propHostelBadge || userProfile?.hostelBadge || 'BH-2 • Room 214';
  const qpAmount = propQpBalance !== undefined ? propQpBalance : (userProfile?.qpBalance ?? 450);

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Upper Bar: Hostel Badge & Gold QP Pill */}
      <View style={styles.topRow}>
        {/* 1. User Hostel Badge */}
        <View style={styles.hostelBadgeContainer}>
          <View style={styles.hostelIconWrapper}>
            <Text style={styles.hostelIcon}>🏢</Text>
          </View>
          <View>
            <Text style={styles.hostelLabel}>HOSTEL</Text>
            <Text style={styles.hostelText}>{hostelText}</Text>
          </View>
        </View>

        {/* 2. Gold Pill Badge showing "450 QP" */}
        <QPBadge amount={qpAmount} />
      </View>

      {/* 3. Toggle Switch for Lazy Mode (#7C3AED) vs Quester Mode (#10B981) */}
      <View style={styles.switchWrapper}>
        <View style={styles.switchTrack}>
          {/* Lazy Mode Option */}
          <TouchableOpacity
            style={[
              styles.switchOption,
              isLazyMode && styles.switchOptionActiveLazy,
            ]}
            onPress={() => setMode('lazy')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Switch to Lazy Mode"
          >
            <Text style={styles.optionIcon}>🛋️</Text>
            <Text
              style={[
                styles.optionText,
                isLazyMode && styles.optionTextActiveLazy,
              ]}
            >
              Lazy Mode
            </Text>
            {isLazyMode && <View style={styles.lazyDot} />}
          </TouchableOpacity>

          {/* Quester Mode Option */}
          <TouchableOpacity
            style={[
              styles.switchOption,
              isQuesterMode && styles.switchOptionActiveQuester,
            ]}
            onPress={() => setMode('quester')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Switch to Quester Mode"
          >
            <Text style={styles.optionIcon}>⚡</Text>
            <Text
              style={[
                styles.optionText,
                isQuesterMode && styles.optionTextActiveQuester,
              ]}
            >
              Quester Mode
            </Text>
            {isQuesterMode && <View style={styles.questerDot} />}
          </TouchableOpacity>
        </View>

        {/* Mini quick toggle slider pill on the side */}
        <Pressable
          onPress={toggleMode}
          style={[
            styles.toggleMiniTrack,
            { backgroundColor: isLazyMode ? Colors.lazyMode : Colors.questerMode },
          ]}
          accessibilityRole="switch"
          accessibilityState={{ checked: isQuesterMode }}
          accessibilityLabel={`Currently in ${isLazyMode ? 'Lazy Mode' : 'Quester Mode'}. Tap to toggle.`}
        >
          <View
            style={[
              styles.toggleMiniThumb,
              isQuesterMode ? styles.toggleThumbRight : styles.toggleThumbLeft,
            ]}
          >
            <Text style={styles.miniThumbIcon}>
              {isLazyMode ? '💤' : '🏃'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface, // #161922
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // #232838
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  // 1. Hostel Badge styles
  hostelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2330',
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#2A3245',
    gap: 8,
  },
  hostelIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#141822',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostelIcon: {
    fontSize: 13,
  },
  hostelLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  hostelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },

  // 3. Mode Switcher styles
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchTrack: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0D0F14',
    borderRadius: Radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#232838',
  },
  switchOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    gap: 6,
  },
  switchOptionActiveLazy: {
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
    borderWidth: 1,
    borderColor: Colors.lazyMode, // #7C3AED
  },
  switchOptionActiveQuester: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: Colors.questerMode, // #10B981
  },
  optionIcon: {
    fontSize: 13,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  optionTextActiveLazy: {
    color: '#DDD6FE',
    fontWeight: '700',
  },
  optionTextActiveQuester: {
    color: '#A7F3D0',
    fontWeight: '700',
  },
  lazyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.lazyMode,
  },
  questerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.questerMode,
  },

  // Mini toggle slider
  toggleMiniTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleMiniThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  toggleThumbLeft: {
    alignSelf: 'flex-start',
  },
  toggleThumbRight: {
    alignSelf: 'flex-end',
  },
  miniThumbIcon: {
    fontSize: 11,
  },
});
