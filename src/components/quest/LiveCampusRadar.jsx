/**
 * LiveCampusRadar — Pulsing live campus hotspot radar
 * Light theme (#FFFFFF background)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';

const CAMPUS_SPOTS = [
  {
    id: 'canteen',
    name: 'Night Canteen',
    peers: 8,
    emoji: '🌙',
    status: 'High Activity',
    category: 'Night Canteen',
  },
  {
    id: 'gate',
    name: 'Main Gate',
    peers: 5,
    emoji: '🚪',
    status: 'Parcels Arrived',
    category: 'Gate Parcel',
  },
  {
    id: 'stationery',
    name: 'Stationery Shop',
    peers: 2,
    emoji: '🖨️',
    status: 'Xerox Open',
    category: 'Printouts',
  },
  {
    id: 'nescafe',
    name: 'Nescafe Corner',
    peers: 4,
    emoji: '☕',
    status: 'Open till 2 AM',
    category: 'Night Canteen',
  },
  {
    id: 'bh2',
    name: 'BH-2 Lobby',
    peers: 7,
    emoji: '🏢',
    status: 'Common Room Active',
    category: 'Borrow Item',
  },
];

export default function LiveCampusRadar({ onSelectSpot }) {
  const { accentColor } = useQuestMode();

  // Pulse animation for the live status dot
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  // Radar sweep animation
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 2.2,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Subtle radar sweep rotation
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseScale, pulseOpacity, sweepAnim]);

  const sweepRotate = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.liveBadgeGroup}>
          <View style={styles.pulseContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.headerTitle}>LIVE CAMPUS RADAR</Text>
        </View>

        <View style={styles.activeCounter}>
          <Text style={styles.activeCounterText}>26 Peers Active</Text>
        </View>
      </View>

      <Text style={styles.radarSubtitle}>
        Real-time hostel density detected near student hubs
      </Text>

      {/* Radar Miniature Visual Strip */}
      <View style={styles.radarScope}>
        {/* Concentric rings */}
        <View style={[styles.scopeRing, { width: 140, height: 140, borderRadius: 70 }]} />
        <View style={[styles.scopeRing, { width: 90, height: 90, borderRadius: 45 }]} />
        <View style={[styles.scopeRing, { width: 40, height: 40, borderRadius: 20 }]} />

        {/* Sweep line */}
        <Animated.View
          style={[
            styles.scopeSweep,
            {
              transform: [{ rotate: sweepRotate }],
            },
          ]}
        />

        {/* Center icon */}
        <View style={[styles.scopeCenterDot, { backgroundColor: accentColor }]}>
          <Text style={styles.scopeCenterText}>📍</Text>
        </View>

        {/* Interactive hotspot blips on the scope */}
        <View style={[styles.blip, { top: 16, left: 32 }]}>
          <Text style={styles.blipText}>🌙 8</Text>
        </View>
        <View style={[styles.blip, { top: 26, right: 36 }]}>
          <Text style={styles.blipText}>🚪 5</Text>
        </View>
        <View style={[styles.blip, { bottom: 18, left: 45 }]}>
          <Text style={styles.blipText}>🖨️ 2</Text>
        </View>
        <View style={[styles.blip, { bottom: 20, right: 40 }]}>
          <Text style={styles.blipText}>☕ 4</Text>
        </View>
      </View>

      {/* Spot Chips Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spotsScroll}
      >
        {CAMPUS_SPOTS.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.spotCard}
            onPress={() => onSelectSpot && onSelectSpot(spot.category)}
            activeOpacity={0.75}
          >
            <View style={styles.spotTop}>
              <Text style={styles.spotEmoji}>{spot.emoji}</Text>
              <View style={styles.peerPill}>
                <View style={styles.onlineMiniDot} />
                <Text style={styles.peerCount}>{spot.peers} peers</Text>
              </View>
            </View>
            <Text style={styles.spotName} numberOfLines={1}>
              {spot.name}
            </Text>
            <Text style={styles.spotStatus}>{spot.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // White
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  liveBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#059669',
  },
  activeCounter: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  radarSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },

  // Radar scope
  radarScope: {
    height: 110,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  scopeRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  scopeSweep: {
    position: 'absolute',
    width: 120,
    height: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.45)',
  },
  scopeCenterDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeCenterText: {
    fontSize: 11,
  },
  blip: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },
  blipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },

  // Spot cards
  spotsScroll: {
    gap: 10,
    paddingRight: 4,
  },
  spotCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 10,
    width: 136,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  spotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  spotEmoji: {
    fontSize: 16,
  },
  peerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  onlineMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  peerCount: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  spotName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  spotStatus: {
    fontSize: 10,
    color: '#64748B',
  },
});
