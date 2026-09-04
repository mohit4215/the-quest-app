/**
 * RadarScanner — Animated campus radar visual for "Do a Quest" screen
 *
 * Uses react-native Animated API to:
 *  - Pulse concentric rings
 *  - Rotate a sweep line (gradient arc simulation)
 *  - Show hotspot pins for campus locations
 *
 * No SVG dependency — all pure RN Views + Animated.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants';

const RADAR_SIZE = Math.min(Dimensions.get('window').width - 48, 300);
const CENTER = RADAR_SIZE / 2;

// AKGEC campus hotspot positions (relative to center, in -1 to 1 space)
const HOTSPOTS = [
  { id: 'sachi', label: 'Sachi Street', emoji: '🏪', x: 0.45, y: -0.35, active: true },
  { id: 'h1', label: 'H-1 Hostel', emoji: '🏠', x: -0.5, y: 0.3, active: true },
  { id: 'h2', label: 'H-2 Hostel', emoji: '🏠', x: -0.3, y: 0.55, active: false },
  { id: 'canteen', label: 'Main Canteen', emoji: '🍽️', x: 0.15, y: -0.55, active: true },
  { id: 'gate', label: 'Main Gate', emoji: '🚪', x: 0.55, y: 0.45, active: false },
  { id: 'lib', label: 'Library', emoji: '📚', x: -0.2, y: -0.4, active: false },
];

export default function RadarScanner({ questCount = 0 }) {
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Continuous sweep rotation
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const sweepRotation = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View style={styles.scanDot} />
          <Text style={styles.statusText}>SCANNING CAMPUS</Text>
        </View>
        <View style={styles.questCount}>
          <Text style={styles.questCountText}>{questCount} quests nearby</Text>
        </View>
      </View>

      {/* Radar disc */}
      <View style={[styles.radarOuter, { width: RADAR_SIZE, height: RADAR_SIZE, borderRadius: CENTER }]}>

        {/* Background rings */}
        {[0.75, 0.5, 0.25].map((scale, i) => (
          <View
            key={i}
            style={[
              styles.ring,
              {
                width: RADAR_SIZE * scale,
                height: RADAR_SIZE * scale,
                borderRadius: (RADAR_SIZE * scale) / 2,
                opacity: 0.35 + i * 0.1,
              },
            ]}
          />
        ))}

        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: RADAR_SIZE * 0.62,
              height: RADAR_SIZE * 0.62,
              borderRadius: (RADAR_SIZE * 0.62) / 2,
              transform: [{ scale: pulseAnim }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Crosshair lines */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />

        {/* Sweep arm */}
        <Animated.View
          style={[
            styles.sweepArm,
            {
              width: CENTER,
              transform: [
                { translateX: CENTER / 2 },
                { rotate: sweepRotation },
                { translateX: -(CENTER / 2) },
              ],
            },
          ]}
        >
          {/* Gradient sweep trail (simulated with opacity layers) */}
          <View style={styles.sweepLine} />
          <View style={[styles.sweepTrail, { opacity: 0.4 }]} />
        </Animated.View>

        {/* Center dot */}
        <View style={styles.centerDot}>
          <View style={styles.centerInner} />
        </View>

        {/* Hotspot pins */}
        {HOTSPOTS.map((spot) => {
          const px = CENTER + spot.x * (CENTER * 0.85) - 14;
          const py = CENTER + spot.y * (CENTER * 0.85) - 14;
          return (
            <View
              key={spot.id}
              style={[
                styles.hotspot,
                {
                  left: px,
                  top: py,
                  opacity: spot.active ? 1 : 0.45,
                },
              ]}
            >
              <Text style={styles.hotspotEmoji}>{spot.emoji}</Text>
              {spot.active && <View style={styles.hotspotPulse} />}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {HOTSPOTS.filter((s) => s.active).map((spot) => (
          <View key={spot.id} style={styles.legendItem}>
            <Text style={styles.legendEmoji}>{spot.emoji}</Text>
            <Text style={styles.legendLabel}>{spot.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  questCount: {
    backgroundColor: 'rgba(255,179,0,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.4)',
  },
  questCountText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },

  // Radar disc
  radarOuter: {
    backgroundColor: 'rgba(13, 71, 161, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(83, 114, 211, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(83, 114, 211, 0.6)',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  crosshairH: {
    position: 'absolute',
    width: '90%',
    height: 1,
    backgroundColor: 'rgba(83, 114, 211, 0.3)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: '90%',
    backgroundColor: 'rgba(83, 114, 211, 0.3)',
  },

  // Sweep
  sweepArm: {
    position: 'absolute',
    height: 2,
    left: CENTER,
    top: CENTER - 1,
    transformOrigin: 'left',
  },
  sweepLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(100, 181, 246, 0.9)',
    top: 0,
    left: 0,
  },
  sweepTrail: {
    position: 'absolute',
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(100, 181, 246, 0.15)',
    top: -9,
    left: 0,
    borderRadius: 2,
  },

  // Center
  centerDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...({
      shadowColor: Colors.primaryLight,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  centerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textInverse,
  },

  // Hotspots
  hotspot: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotEmoji: {
    fontSize: 16,
  },
  hotspotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    opacity: 0.6,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  legendEmoji: {
    fontSize: 11,
  },
  legendLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '500',
  },
});
