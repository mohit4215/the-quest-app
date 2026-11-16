/**
 * LiveCampusRadar — Pilot's Dashboard Live Campus Hotspot Radar
 * Theme: OLED Black (#000000) with Neon Emerald & Alert Red Pulsing Blobs
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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';

const CAMPUS_SPOTS = [
  {
    id: 'gate',
    name: 'Main Gate',
    peers: 5,
    icon: 'cube',
    status: 'High Bounty Parcel',
    category: 'Gate Parcel',
    isUrgent: true,
  },
  {
    id: 'canteen',
    name: 'Night Canteen',
    peers: 8,
    icon: 'restaurant',
    status: 'High Activity',
    category: 'Night Canteen',
  },
  {
    id: 'stationery',
    name: 'Stationery Shop',
    peers: 2,
    icon: 'print',
    status: 'Xerox Open',
    category: 'Printouts',
  },
  {
    id: 'nescafe',
    name: 'Nescafe Corner',
    peers: 4,
    icon: 'cafe',
    status: 'Open till 2 AM',
    category: 'Night Canteen',
  },
  {
    id: 'bh2',
    name: 'BH-2 Lobby',
    peers: 7,
    icon: 'business',
    status: 'Dropoff Hub',
    category: 'Borrow Item',
  },
];

export default function LiveCampusRadar({ onSelectSpot }) {
  const { accentColor, isQuesterMode } = useQuestMode();

  // Pulse animation for the live status dot
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;

  // Urgent gate parcel beacon pulse
  const redPulseScale = useRef(new Animated.Value(1)).current;
  const redPulseOpacity = useRef(new Animated.Value(0.9)).current;

  // Radar sweep animation
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous green pulse
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
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Urgent Red beacon pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(redPulseScale, {
            toValue: 2.6,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(redPulseOpacity, {
            toValue: 0,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(redPulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(redPulseOpacity, {
            toValue: 0.9,
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
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseScale, pulseOpacity, redPulseScale, redPulseOpacity, sweepAnim]);

  const sweepRotate = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[
      styles.card,
      isQuesterMode && styles.cardQuester,
    ]}>
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
          <Text style={styles.activeCounterText}>26 Questers Active</Text>
        </View>
      </View>

      <Text style={styles.radarSubtitle}>
        Heatmap pulses show high-value orders & runner traffic
      </Text>

      {/* Radar Scope Display */}
      <View style={styles.radarScope}>
        {/* Concentric rings */}
        <View style={[styles.scopeRing, { width: 150, height: 150, borderRadius: 75 }]} />
        <View style={[styles.scopeRing, { width: 100, height: 100, borderRadius: 50 }]} />
        <View style={[styles.scopeRing, { width: 44, height: 44, borderRadius: 22 }]} />

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
          <Ionicons name="navigate" size={13} color="#FFFFFF" />
        </View>

        {/* Urgent Gate Parcel Beacon (Glowing Red Dot) */}
        <View style={[styles.gateBeacon, { top: 22, right: 34 }]}>
          <Animated.View
            style={[
              styles.redPulseRing,
              {
                transform: [{ scale: redPulseScale }],
                opacity: redPulseOpacity,
              },
            ]}
          />
          <View style={styles.redDot} />
          <Text style={styles.gateBeaconText}>Gate • 3 Waiting</Text>
        </View>

        {/* Other hotspot blips */}
        <View style={[styles.blip, { top: 18, left: 24 }]}>
          <Text style={styles.blipText}>Canteen • 8</Text>
        </View>
        <View style={[styles.blip, { bottom: 18, left: 38 }]}>
          <Text style={styles.blipText}>Xerox • 2</Text>
        </View>
        <View style={[styles.blip, { bottom: 20, right: 38 }]}>
          <Text style={styles.blipText}>Nescafe • 4</Text>
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
            style={[
              styles.spotCard,
              spot.isUrgent && styles.spotCardUrgent,
            ]}
            onPress={() => onSelectSpot && onSelectSpot(spot.category)}
            activeOpacity={0.8}
          >
            <View style={styles.spotTop}>
              <Ionicons
                name={spot.icon}
                size={16}
                color={spot.isUrgent ? '#EF4444' : Colors.questerMode}
              />
              <View style={[styles.peerPill, spot.isUrgent && styles.peerPillUrgent]}>
                <View style={[styles.onlineMiniDot, spot.isUrgent && { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.peerCount, spot.isUrgent && { color: '#EF4444' }]}>
                  {spot.peers} active
                </Text>
              </View>
            </View>
            <Text style={styles.spotName}>{spot.name}</Text>
            <Text style={styles.spotStatus}>{spot.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121217',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.base,
  },
  cardQuester: {
    backgroundColor: '#13251E', // Deep emerald surface
    borderColor: 'rgba(16, 185, 129, 0.25)',
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#10B981',
  },
  activeCounter: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  activeCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  radarSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
  },

  // Radar scope
  radarScope: {
    height: 124,
    backgroundColor: '#090D0B',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  scopeRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
  },
  scopeSweep: {
    position: 'absolute',
    width: 130,
    height: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.65)',
  },
  scopeCenterDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  // Gate Urgent Beacon
  gateBeacon: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  redPulseRing: {
    position: 'absolute',
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  gateBeaconText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FCA5A5',
  },

  // Other blips
  blip: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  blipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
  },

  // Spot cards
  spotsScroll: {
    gap: 10,
    paddingRight: 4,
  },
  spotCard: {
    backgroundColor: '#181E1B',
    borderRadius: Radius.md,
    padding: 10,
    width: 132,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  spotCardUrgent: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: '#1F1416',
  },
  spotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  peerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  peerPillUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
    color: '#34D399',
  },
  spotName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  spotStatus: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
