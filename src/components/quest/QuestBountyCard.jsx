/**
 * QuestBountyCard — Gamified Hostel Micro-Delivery Bounty Card
 * Requirements:
 * - Item title
 * - Pickup spot -> Drop-off Hostel & Room
 * - Countdown timer ("15 mins left")
 * - Cash Tip (₹30) + QP Reward (+50 QP)
 * - "Accept Quest" button (visible in Quester Mode)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';

export default function QuestBountyCard({
  quest,
  onAccept,
  onViewDetails,
}) {
  const { isQuesterMode, isLazyMode } = useQuestMode();
  const [accepted, setAccepted] = useState(quest.isAccepted || false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleAccept = () => {
    if (accepted) return;

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, speed: 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, speed: 30, useNativeDriver: true }),
    ]).start(() => {
      setAccepted(true);
      if (onAccept) onAccept(quest);
    });
  };

  const isUrgent = quest.countdown && (quest.countdown.includes('8 min') || quest.countdown.includes('10 min'));

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Top Row: Category Tag & Countdown Timer */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {quest.categoryIcon || '📦'} {quest.category}
          </Text>
        </View>

        {/* Countdown Timer ("15 mins left") */}
        <View style={[styles.timerBadge, isUrgent && styles.timerBadgeUrgent]}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {quest.countdown || '15 mins left'}
          </Text>
        </View>
      </View>

      {/* Item Title */}
      <Text style={styles.itemTitle}>{quest.item}</Text>

      {/* Route: Pickup Spot -> Drop-off Hostel & Room */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <Text style={styles.routeIcon}>📍</Text>
          <Text style={styles.routeLabel}>Pickup:</Text>
          <Text style={styles.routeValue} numberOfLines={1}>{quest.pickupSpot}</Text>
        </View>
        <View style={styles.routeArrowRow}>
          <View style={styles.routeDottedLine} />
          <Text style={styles.routeArrow}>↓</Text>
        </View>
        <View style={styles.routeRow}>
          <Text style={styles.routeIcon}>🏠</Text>
          <Text style={styles.routeLabel}>Drop-off:</Text>
          <Text style={styles.routeValueHighlight} numberOfLines={1}>
            {quest.dropOffHostelRoom}
          </Text>
        </View>
      </View>

      {/* Notes if present */}
      {quest.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesText} numberOfLines={2}>
            💬 "{quest.notes}"
          </Text>
        </View>
      ) : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Row: Cash Tip + QP Reward & Action Button */}
      <View style={styles.bottomRow}>
        {/* Rewards Bundle: Cash Tip (₹30) + QP Reward (+50 QP) */}
        <View style={styles.rewardsGroup}>
          {/* Cash Tip */}
          <View style={styles.cashTipPill}>
            <Text style={styles.cashTipText}>💵 {quest.cashTip || '₹30'}</Text>
          </View>

          {/* QP Reward */}
          <View style={styles.qpRewardPill}>
            <Text style={styles.qpCoin}>🪙</Text>
            <Text style={styles.qpText}>{quest.qpReward || '+50 QP'}</Text>
          </View>
        </View>

        {/* Action Button: Visible in Quester Mode */}
        {isQuesterMode && (
          <TouchableOpacity
            style={[
              styles.acceptBtn,
              accepted && styles.acceptedBtn,
            ]}
            onPress={handleAccept}
            disabled={accepted}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={accepted ? 'Quest Accepted' : 'Accept Quest'}
          >
            <Text style={[styles.acceptBtnText, accepted && styles.acceptedBtnText]}>
              {accepted ? '✓ Accepted' : '⚡ Accept Quest'}
            </Text>
          </TouchableOpacity>
        )}

        {/* In Lazy Mode, show a subtle details / status button */}
        {isLazyMode && (
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onViewDetails && onViewDetails(quest)}
            activeOpacity={0.75}
          >
            <Text style={styles.detailsBtnText}>Details →</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border, // #232838
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 4,
  },
  timerBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  timerIcon: {
    fontSize: 11,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  timerTextUrgent: {
    color: '#F87171',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },

  // Route: Pickup Spot -> Drop-off Hostel & Room
  routeContainer: {
    backgroundColor: '#11141C',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E2433',
    marginBottom: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeIcon: {
    fontSize: 12,
  },
  routeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  routeValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  routeValueHighlight: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '700',
    flex: 1,
  },
  routeArrowRow: {
    paddingLeft: 4,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeDottedLine: {
    width: 1,
    height: 10,
    backgroundColor: '#2A3245',
    marginLeft: 5,
  },
  routeArrow: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 14,
  },

  notesBox: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  divider: {
    height: 1,
    backgroundColor: '#1E2330',
    marginBottom: 12,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cashTipPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  cashTipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },
  qpRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    gap: 4,
  },
  qpCoin: {
    fontSize: 11,
  },
  qpText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
  },

  // Buttons
  acceptBtn: {
    backgroundColor: '#10B981', // Quester mode green
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  acceptedBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  acceptedBtnText: {
    color: '#34D399',
  },
  detailsBtn: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  detailsBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
