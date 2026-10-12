/**
 * QuestBountyCard — Gamified Hostel Micro-Delivery Bounty Card
 * White UI Theme
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
    backgroundColor: '#FFFFFF', // White background
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  timerBadgeUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  timerIcon: {
    fontSize: 11,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  timerTextUrgent: {
    color: '#DC2626',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 22,
  },

  // Route: Pickup Spot -> Drop-off Hostel & Room
  routeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    fontWeight: '600',
  },
  routeValue: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  routeValueHighlight: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
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
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
  },
  routeArrow: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 14,
  },

  notesBox: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  cashTipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  qpRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 4,
  },
  qpCoin: {
    fontSize: 11,
  },
  qpText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },

  // Buttons
  acceptBtn: {
    backgroundColor: '#10B981', // Quester mode green
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  acceptedBtn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  acceptedBtnText: {
    color: '#059669',
  },
  detailsBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
});
