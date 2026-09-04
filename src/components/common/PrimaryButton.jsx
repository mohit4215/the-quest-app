/**
 * PrimaryButton — Main CTA button
 * Supports variants: filled (default), outlined, ghost, danger
 * Supports sizes: sm, md (default), lg
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../../constants';

export default function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  labelStyle,
}) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`variant_${variant}_disabled`],
    style,
  ];

  const textStyle = [
    styles.label,
    styles[`label_${size}`],
    styles[`label_${variant}`],
    isDisabled && styles.labelDisabled,
    labelStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? Colors.textInverse : Colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Text style={[styles.icon, styles[`label_${size}`]]}>{icon}</Text>
          )}
          <Text style={textStyle}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <Text style={[styles.icon, styles[`label_${size}`]]}>{icon}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  icon: {
    lineHeight: 22,
  },

  // Sizes
  size_sm: { height: 38, paddingHorizontal: Spacing.md },
  size_md: { height: Layout.buttonHeight, paddingHorizontal: Spacing.xl },
  size_lg: { height: 58, paddingHorizontal: Spacing.xxl },

  // Variants — container
  variant_filled: {
    backgroundColor: Colors.primary,
    ...Shadow.lg,
  },
  variant_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  variant_ghost: {
    backgroundColor: Colors.accent,
  },
  variant_danger: {
    backgroundColor: Colors.error,
  },
  variant_gold: {
    backgroundColor: Colors.gold,
    ...Shadow.md,
  },

  // Variants — label color
  label: {
    fontWeight: '700',
  },
  label_sm: { fontSize: 13 },
  label_md: { fontSize: 15 },
  label_lg: { fontSize: 17 },

  label_filled: { color: Colors.textInverse },
  label_outlined: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: Colors.textInverse },
  label_gold: { color: Colors.textPrimary },

  // Disabled states
  disabled: { opacity: 0.52 },
  labelDisabled: {},
});
