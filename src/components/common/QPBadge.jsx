/**
 * QPBadge — Quest Points display pill
 * Gold glowing pill badge with aura for OLED dark theme.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants';

export default function QPBadge({ amount = 450, size = 'md', style }) {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.container, isLarge && styles.containerLg, style]}>
      <View style={styles.glowAura} />
      <Ionicons
        name="sparkles"
        size={isLarge ? 16 : 13}
        color="#F59E0B"
        style={{ marginRight: 5 }}
      />
      <Text style={[styles.amount, isLarge && styles.amountLg]}>
        {typeof amount === 'number' ? amount.toLocaleString() : amount}
      </Text>
      <Text style={[styles.label, isLarge && styles.labelLg]}> QP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E170A', // Deep gold-tinted dark surface
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignSelf: 'flex-start',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  glowAura: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  containerLg: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  amount: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  amountLg: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 2,
  },
  labelLg: {
    fontSize: 13,
  },
});
