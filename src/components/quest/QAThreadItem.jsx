/**
 * QAThreadItem — Single Q&A thread row for Home Dashboard community section
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants';
import Avatar from '../common/Avatar';

export default function QAThreadItem({ thread, onPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <Avatar name={thread.authorName} size="md" />

      <View style={styles.body}>
        <Text style={styles.question} numberOfLines={2}>
          {thread.question}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{thread.authorName}</Text>
          <View style={styles.dot} />
          <Text style={styles.tag}>{thread.tag}</Text>
          <View style={styles.dot} />
          <Text style={styles.timeAgo}>{thread.timeAgo}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statValue}>{thread.replyCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👍</Text>
          <Text style={styles.statValue}>{thread.upvotes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.sm,
  },
  body: {
    flex: 1,
  },
  question: {
    ...Typography.bodyLg,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 5,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  author: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  tag: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontWeight: '500',
  },
  timeAgo: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  stats: {
    alignItems: 'flex-end',
    gap: 4,
    paddingTop: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statIcon: {
    fontSize: 11,
  },
  statValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
});
