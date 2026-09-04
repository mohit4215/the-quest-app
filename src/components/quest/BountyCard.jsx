/**
 * BountyCard — Individual quest/delivery bounty listing card
 * Shown in the "Do a Quest" courier feed.
 * State: open → claimed → completed (managed by parent via onClaim)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants';
import StatusChip from '../common/StatusChip';
import QPBadge from '../common/QPBadge';
import Avatar from '../common/Avatar';

export default function BountyCard({ quest, onClaim }) {
  const [claiming, setClaiming] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const isClaimed = quest.status === 'claimed' || quest.status === 'active';

  function handleClaim() {
    if (isClaimed || claiming) return;
    setClaiming(true);

    // Brief spring animation on press
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
      }),
    ]).start(() => {
      setClaiming(false);
      onClaim && onClaim(quest.id);
    });
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.card}>
        {/* Header row: item name + status chip */}
        <View style={styles.headerRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {quest.item}
          </Text>
          <StatusChip
            label={isClaimed ? 'Claimed' : 'Open'}
            variant={isClaimed ? 'claimed' : 'open'}
          />
        </View>

        {/* Meta row: vendor + drop-off */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🏪</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {quest.vendor}
            </Text>
          </View>
          <View style={styles.metaSeparator} />
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🏠</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {quest.dropOff}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {quest.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {quest.notes}
          </Text>
        ) : null}

        {/* Footer: poster + bounty + claim button */}
        <View style={styles.footer}>
          <View style={styles.posterRow}>
            <Avatar name={quest.posterName} size="sm" />
            <View style={styles.posterInfo}>
              <Text style={styles.posterName}>{quest.posterName}</Text>
              <Text style={styles.timeAgo}>{quest.timeAgo}</Text>
            </View>
          </View>

          <View style={styles.footerRight}>
            <QPBadge amount={quest.bounty} />
            <TouchableOpacity
              style={[
                styles.claimBtn,
                isClaimed && styles.claimBtnClaimed,
              ]}
              onPress={handleClaim}
              disabled={isClaimed || claiming}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isClaimed ? 'Quest claimed' : `Claim quest for ${quest.bounty} QP`}
            >
              <Text style={[styles.claimBtnText, isClaimed && styles.claimBtnTextClaimed]}>
                {isClaimed ? '✓ Claimed' : '⚡ Claim'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemName: {
    ...Typography.headingSm,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    flex: 1,
  },
  metaSeparator: {
    width: 1,
    height: 16,
    backgroundColor: Colors.accentBorder,
  },
  notes: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontSize: 12,
  },
  timeAgo: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  claimBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    ...Shadow.md,
  },
  claimBtnClaimed: {
    backgroundColor: Colors.successLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  claimBtnText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  claimBtnTextClaimed: {
    color: Colors.success,
  },
});
