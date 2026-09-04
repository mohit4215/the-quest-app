/**
 * Card — Base surface card with shadow and border
 * Thin wrapper that enforces consistent surface styles.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../../constants';

export default function Card({ children, style, padding = 'md', elevated = false }) {
  const paddingValue = {
    none: 0,
    sm: Spacing.sm,
    md: Spacing.base,
    lg: Spacing.xl,
  }[padding] ?? Spacing.base;

  return (
    <View
      style={[
        styles.card,
        { padding: paddingValue },
        elevated ? Shadow.lg : Shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
