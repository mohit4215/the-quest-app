/**
 * QPBadge — Quest Points display pill
 * Gold pill badge showing QP balance for light theme (#FFFFFF background).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants';

export default function QPBadge({ amount = 450, size = 'md', style }) {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.container, isLarge && styles.containerLg, style]}>
      <Ionicons
        name="sparkles"
        size={isLarge ? 16 : 13}
        color="#D97706"
        style={{ marginRight: 4 }}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FCD34D',
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
    color: '#B45309',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  amountLg: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: '#D97706',
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
