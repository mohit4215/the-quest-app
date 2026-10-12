/**
 * QPBadge — Quest Points display pill
 * Gold pill badge showing QP balance for dark theme (#0D0F14 / #161922).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants';

export default function QPBadge({ amount = 450, size = 'md', style }) {
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
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    alignSelf: 'flex-start',
  },
  containerLg: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  coin: {
    fontSize: 13,
    marginRight: 4,
  },
  coinLg: {
    fontSize: 18,
    marginRight: 6,
  },
  amount: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '700',
    marginLeft: 3,
  },
});
