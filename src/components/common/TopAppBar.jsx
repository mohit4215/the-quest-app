/**
 * TopAppBar — Header component for "Quest"
 * Features:
 * - Lemon yellow logo ("Q")
 * - User Hostel badge ("BH-2 • Room 214")
 * - Gold pill badge showing "450 QP" (Quest Points)
 * - Toggle switch to flip between "Lazy Mode" (Purple #7C3AED) and "Quester Mode" (Green #10B981)
 * - White UI background theme
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
      {/* Upper Bar: Lemon Yellow Logo + Hostel Badge + Gold QP Pill */}
      <View style={styles.topRow}>
        {/* Left: Lemon Yellow Logo + Hostel Badge */}
        <View style={styles.leftGroup}>
          {/* Lemon Yellow Logo */}
          <View style={styles.lemonLogo}>
            <Text style={styles.lemonLogoText}>Q</Text>
          </View>

          {/* User Hostel Badge */}
          <View style={styles.hostelBadgeContainer}>
            <Text style={styles.hostelIcon}>🏢</Text>
            <View>
              <Text style={styles.hostelLabel}>HOSTEL</Text>
              <Text style={styles.hostelText}>{hostelText}</Text>
            </View>
          </View>
        </View>

        {/* Right: Gold Pill Badge showing "450 QP" */}
        <QPBadge amount={qpAmount} />
      </View>

      {/* Mode Switcher: Lazy Mode (Purple #7C3AED) vs Quester Mode (Green #10B981) */}
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
    backgroundColor: '#FFFFFF', // White background
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Lemon Yellow Logo
  lemonLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FAEA48', // Lemon Yellow
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  lemonLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A', // Dark contrasting text
    letterSpacing: -0.5,
  },
  // Hostel Badge
  hostelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  hostelIcon: {
    fontSize: 13,
  },
  hostelLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#64748B',
  },
  hostelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Mode Switcher styles
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchTrack: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    gap: 6,
  },
  switchOptionActiveLazy: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.lazyMode, // #7C3AED
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  switchOptionActiveQuester: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.questerMode, // #10B981
    shadowColor: Colors.questerMode,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  optionIcon: {
    fontSize: 13,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  optionTextActiveLazy: {
    color: Colors.lazyMode,
    fontWeight: '700',
  },
  optionTextActiveQuester: {
    color: Colors.questerMode,
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
    shadowOpacity: 0.2,
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
