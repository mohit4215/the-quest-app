/**
 * ActionGridItem — Large tappable action tile for the Home dashboard grid
 * Used for "Post a Quest" and "Do a Quest" primary actions.
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadow, Typography } from '../../constants';

export default function ActionGridItem({
  icon,
  title,
  subtitle,
  gradientColors,
  onPress,
  badge,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 60,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${subtitle}`}
      >
        <LinearGradient
          colors={gradientColors || [Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Badge (e.g. live count) */}
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}

          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Bottom arrow cue */}
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: Spacing.base,
    paddingBottom: Spacing.lg,
    minHeight: 140,
    borderRadius: Radius.xl,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.headingSm,
    color: Colors.textInverse,
    marginBottom: 3,
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
  },
  arrow: {
    position: 'absolute',
    bottom: Spacing.base,
    right: Spacing.base,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
