/**
 * LiveCampusRadar — Pulsing live campus hotspot radar
 * Displays real-time peer count near college hubs:
 * - "8 peers at Night Canteen"
 * - "5 peers at Main Gate"
 * - "2 peers at Stationery Shop"
 * - "4 peers at Nescafe Corner"
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
        <View style={[styles.blip, { top: 18, left: 32 }]}>
          <Text style={styles.blipText}>🌙 8</Text>
        </View>
        <View style={[styles.blip, { top: 28, right: 36 }]}>
          <Text style={styles.blipText}>🚪 5</Text>
        </View>
        <View style={[styles.blip, { bottom: 20, left: 45 }]}>
          <Text style={styles.blipText}>🖨️ 2</Text>
        </View>
        <View style={[styles.blip, { bottom: 22, right: 40 }]}>
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
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border, // #232838
    marginBottom: Spacing.lg,
    overflow: 'hidden',
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
    color: '#10B981',
  },
  activeCounter: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  activeCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  radarSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
  },

  // Radar scope
  radarScope: {
    height: 110,
    backgroundColor: '#0D0F14',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1F2432',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  scopeRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  blipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
  },

  // Spot cards
  spotsScroll: {
    gap: 10,
    paddingRight: 4,
  },
  spotCard: {
    backgroundColor: '#1A1F2C',
    borderRadius: Radius.md,
    padding: 10,
    width: 136,
    borderWidth: 1,
    borderColor: '#242B3C',
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
    backgroundColor: '#12151E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
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
    color: Colors.textSecondary,
  },
  spotName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  spotStatus: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
