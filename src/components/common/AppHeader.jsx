/**
 * AppHeader — Top navigation bar
 * Displays greeting, AKGEC branding, QP balance, and notification bell.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Shadow } from '../../constants';
import QPBadge from './QPBadge';

export default function AppHeader({ title, subtitle, qpBalance, onNotifPress, showQP = true }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <View style={styles.left}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>Q</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title || 'Quest'}</Text>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {showQP && qpBalance !== undefined && (
          <QPBadge amount={qpBalance} style={styles.qpBadge} />
        )}
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={onNotifPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Text style={styles.notifIcon}>🔔</Text>
          {/* Unread dot */}
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleBlock: {
    justifyContent: 'center',
  },
  title: {
    ...Typography.headingSm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qpBadge: {
    marginRight: 4,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifIcon: {
    fontSize: 17,
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
});
