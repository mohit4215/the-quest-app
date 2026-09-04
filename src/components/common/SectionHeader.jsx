/**
 * SectionHeader — Labeled section title with optional "See All" link
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants';

export default function SectionHeader({ title, actionLabel = 'See All', onAction, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.headingSm,
    color: Colors.textPrimary,
  },
  action: {
    ...Typography.label,
    color: Colors.primary,
    fontSize: 13,
  },
});
