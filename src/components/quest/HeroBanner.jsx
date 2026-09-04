/**
 * HeroBanner — "Talk to a Senior" promotional hero card
 * Positioned prominently on the Home Dashboard.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants';

export default function HeroBanner({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Talk to a Senior — get academic guidance from AKGEC seniors"
    >
      <LinearGradient
        colors={['#1565C0', '#0D47A1', '#002171']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.content}>
          <View style={styles.left}>
            <View style={styles.tagRow}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.tagLine}>Academic Help</Text>
            </View>

            <Text style={styles.heading}>Talk to a{'\n'}Senior 🎓</Text>
            <Text style={styles.subText}>
              Get real answers from AKGEC seniors on placements, labs, or backlog strategy.
            </Text>

            <View style={styles.ctaBtn}>
              <Text style={styles.ctaText}>Ask Now  →</Text>
            </View>
          </View>

          <View style={styles.right}>
            <View style={styles.avatarStack}>
              {['RV', 'SK', 'AP', 'NM'].map((initials, i) => (
                <View
                  key={initials}
                  style={[
                    styles.stackAvatar,
                    { marginLeft: i === 0 ? 0 : -10, zIndex: 4 - i },
                  ]}
                >
                  <Text style={styles.stackInitials}>{initials}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.onlineCount}>24 seniors online</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  gradient: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  // Decorative background circles
  circle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -40,
    right: -20,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    right: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    marginRight: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.textInverse,
  },
  liveText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagLine: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  heading: {
    ...Typography.headingLg,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },
  subText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  right: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  avatarStack: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  stackAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackInitials: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  onlineCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
