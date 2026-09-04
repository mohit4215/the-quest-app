/**
 * StatusChip — Small colored pill for quest/delivery status labels
 * Variants: active, pending, completed, claimed, open
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants';

const VARIANT_MAP = {
  open: { bg: Colors.infoLight, text: Colors.info, dot: Colors.info },
  active: { bg: Colors.successLight, text: Colors.success, dot: Colors.success },
  claimed: { bg: Colors.goldLight, text: Colors.goldDark, dot: Colors.gold },
  pending: { bg: Colors.warningLight, text: Colors.warning, dot: Colors.warning },
  completed: { bg: Colors.successLight, text: Colors.success, dot: Colors.success },
  cancelled: { bg: Colors.errorLight, text: Colors.error, dot: Colors.error },
};

export default function StatusChip({ label, variant = 'open', style }) {
  const theme = VARIANT_MAP[variant] || VARIANT_MAP.open;

  return (
    <View style={[styles.chip, { backgroundColor: theme.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: theme.dot }]} />
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
