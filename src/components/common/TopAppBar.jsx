/**
 * TopAppBar — Omni-Nav Header component for "Quest"
 * Features:
 * - Top Left: User Avatar with Gamification Tier Progress Ring
 * - Top Center: Physical-feeling Mode Pill Toggle (🛋️ Lazy Purple vs 🏃 Quester Emerald)
 * - Top Right: Live QP Balance with glowing aura
 * - OLED Dark theme (#000000 background)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

  const hostelText = propHostelBadge || userProfile?.hostelBadge || 'BH-2 • #214';
  const qpAmount = propQpBalance !== undefined ? propQpBalance : (userProfile?.qpBalance ?? 450);

  // Gamification Tier logic
  const getTierInfo = (qp) => {
    if (qp >= 2000) return { name: 'Master', color: '#8B5CF6' };
    if (qp >= 1000) return { name: 'Gold', color: '#F59E0B' };
    if (qp >= 400)  return { name: 'Silver', color: '#38BDF8' };
    return { name: 'Scout', color: '#10B981' };
  };

  const tier = getTierInfo(qpAmount);

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.topRow}>
        {/* Top Left: Avatar with Gamification Tier Ring */}
        <TouchableOpacity
          style={styles.avatarContainer}
          activeOpacity={0.8}
          accessibilityLabel="User profile and tier"
        >
          <View style={[styles.tierRing, { borderColor: tier.color }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(userProfile?.name || 'M')[0].toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.userMeta}>
            <View style={styles.tierTag}>
              <Text style={[styles.tierLabel, { color: tier.color }]}>
                {tier.name.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.hostelText} numberOfLines={1}>
              {hostelText}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Top Right: Glowing QP Balance */}
        <QPBadge amount={qpAmount} />
      </View>

      {/* Top Center: Omni-Nav Pill Switcher */}
      <View style={styles.switchWrapper}>
        <View style={styles.switchTrack}>
          {/* Lazy Mode Option */}
          <TouchableOpacity
            style={[
              styles.switchOption,
              isLazyMode && styles.switchOptionActiveLazy,
            ]}
            onPress={() => setMode('lazy')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Switch to Lazy Mode"
          >
            <Ionicons
              name="bed"
              size={14}
              color={isLazyMode ? '#FFFFFF' : Colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.optionText,
                isLazyMode && styles.optionTextActiveLazy,
              ]}
            >
              Lazy Mode
            </Text>
          </TouchableOpacity>

          {/* Quester Mode Option */}
          <TouchableOpacity
            style={[
              styles.switchOption,
              isQuesterMode && styles.switchOptionActiveQuester,
            ]}
            onPress={() => setMode('quester')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Switch to Quester Mode"
          >
            <Ionicons
              name="flash"
              size={14}
              color={isQuesterMode ? '#FFFFFF' : Colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.optionText,
                isQuesterMode && styles.optionTextActiveQuester,
              ]}
            >
              Quester Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000000', // OLED Black
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E1E28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userMeta: {
    justifyContent: 'center',
  },
  tierTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  hostelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Omni-Nav Pill Switcher
  switchWrapper: {
    marginTop: 2,
  },
  switchTrack: {
    flexDirection: 'row',
    backgroundColor: '#121217',
    borderRadius: Radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  switchOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  switchOptionActiveLazy: {
    backgroundColor: Colors.lazyMode, // Electric Purple
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  switchOptionActiveQuester: {
    backgroundColor: Colors.questerMode, // Neon Emerald
    shadowColor: Colors.questerMode,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  optionTextActiveLazy: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  optionTextActiveQuester: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
