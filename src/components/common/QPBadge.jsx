/**
 * QPBadge — Quest Points display pill
 * Shows gold coin icon + QP balance, used in headers and cards.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants';

export default function QPBadge({ amount, size = 'md', style }) {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.container, isLarge && styles.containerLg, style]}>
      <Text style={[styles.coin, isLarge && styles.coinLg]}>🪙</Text>
      <Text style={[styles.amount, isLarge && styles.amountLg]}>
        {typeof amount === 'number' ? amount.toLocaleString() : amount}
      </Text>
      <Text style={[styles.label, isLarge && styles.labelLg]}> QP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FFE082',
    alignSelf: 'flex-start',
  },
  containerLg: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  coin: {
    fontSize: 14,
    marginRight: 4,
  },
  coinLg: {
    fontSize: 20,
  },
  amount: {
    ...Typography.label,
    color: Colors.goldDark,
    fontSize: 13,
    fontWeight: '700',
  },
  amountLg: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    ...Typography.caption,
    color: Colors.goldDark,
    fontWeight: '600',
    fontSize: 11,
  },
  labelLg: {
    fontSize: 14,
  },
});
