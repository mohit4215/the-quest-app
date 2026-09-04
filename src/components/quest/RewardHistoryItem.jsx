/**
 * RewardHistoryItem — Single row in the QP reward history list on Home Dashboard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants';

export default function RewardHistoryItem({ item }) {
  const isEarned = item.type === 'earned';

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: isEarned ? Colors.successLight : Colors.errorLight }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isEarned ? Colors.success : Colors.error }]}>
          {isEarned ? '+' : '-'}{item.amount} QP
        </Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  body: {
    flex: 1,
  },
  title: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
  },
  date: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
