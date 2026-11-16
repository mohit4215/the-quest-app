/**
 * QuestBountyCard — Gamified Hostel Micro-Delivery Bounty Card
 * Theme: "Dynamic Duality" with Vertical Route Timeline & "Slide to Claim"
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';

export default function QuestBountyCard({
  quest,
  onAccept,
  onViewDetails,
}) {
  const { isQuesterMode, isLazyMode } = useQuestMode();
  const [accepted, setAccepted] = useState(quest.isAccepted || false);
  const [sliderWidth, setSliderWidth] = useState(240);

  // Slide to claim animation value
  const slideX = useRef(new Animated.Value(0)).current;

  // Max slide distance is (sliderWidth - thumbWidth)
  const thumbWidth = 44;
  const maxSlide = Math.max(sliderWidth - thumbWidth - 8, 120);

  // PanResponder for Slide to Claim gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !accepted,
      onMoveShouldSetPanResponder: (_, gestureState) => !accepted && Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (accepted) return;
        const newX = Math.max(0, Math.min(gestureState.dx, maxSlide));
        slideX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (accepted) return;
        if (gestureState.dx >= maxSlide * 0.75) {
          // Completed slide!
          Animated.timing(slideX, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setAccepted(true);
            if (onAccept) onAccept(quest);
          });
        } else {
          // Snap back
          Animated.spring(slideX, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const isUrgent = quest.countdown && (quest.countdown.includes('8 min') || quest.countdown.includes('10 min'));

  return (
    <View style={[
      styles.card,
      isQuesterMode ? styles.cardQuester : styles.cardLazy,
      isUrgent && styles.cardUrgent,
    ]}>
      {/* Top Row: Category Tag & Timer */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {quest.category}
          </Text>
        </View>

        {/* Countdown Timer with pulse */}
        <View style={[styles.timerBadge, isUrgent && styles.timerBadgeUrgent]}>
          <Ionicons
            name="time"
            size={12}
            color={isUrgent ? '#EF4444' : '#38BDF8'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {quest.countdown || '15 mins left'}
          </Text>
        </View>
      </View>

      {/* Item Title & Cash Bounty */}
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{quest.item}</Text>
        <View style={styles.cashPill}>
          <Text style={styles.cashPillText}>{quest.cashTip || '₹30'}</Text>
        </View>
      </View>

      {/* Vertical Route Timeline */}
      <View style={styles.routeContainer}>
        {/* Left Vertical Line */}
        <View style={styles.timelineCol}>
          <View style={styles.pickupDot} />
          <View style={styles.timelineLine} />
          <View style={styles.dropoffDot} />
        </View>

        {/* Right Station Details */}
        <View style={styles.stationsCol}>
          <View style={styles.stationRow}>
            <Text style={styles.stationLabel}>PICKUP</Text>
            <Text style={styles.stationText} numberOfLines={1}>{quest.pickupSpot}</Text>
          </View>
          <View style={[styles.stationRow, { marginTop: 14 }]}>
            <Text style={styles.stationLabel}>DROPOFF</Text>
            <Text style={styles.dropoffHighlight} numberOfLines={1}>
              {quest.dropOffHostelRoom}
            </Text>
          </View>
        </View>

        {/* Massive Reward Pill */}
        <View style={styles.qpRewardBox}>
          <Ionicons name="sparkles" size={14} color="#F59E0B" />
          <Text style={styles.qpRewardAmount}>{quest.qpReward || '+50 QP'}</Text>
        </View>
      </View>

      {/* Notes if present */}
      {quest.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesText} numberOfLines={2}>
            "{quest.notes}"
          </Text>
        </View>
      ) : null}

      {/* Interaction: Slide to Claim (in Quester Mode) or View Details (Lazy Mode) */}
      {isQuesterMode ? (
        <View
          style={styles.sliderContainer}
          onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        >
          {accepted ? (
            <View style={styles.acceptedBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.acceptedBannerText}>CLAIMED • EN ROUTE</Text>
            </View>
          ) : (
            <View style={styles.sliderTrack}>
              <Text style={styles.sliderHintText}>SLIDE TO CLAIM  ➔</Text>
              <Animated.View
                style={[
                  styles.sliderThumb,
                  {
                    transform: [{ translateX: slideX }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Ionicons name="flash" size={18} color="#FFFFFF" />
              </Animated.View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.lazyActionRow}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onViewDetails && onViewDetails(quest)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>View Details & Status →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardQuester: {
    backgroundColor: '#13251E', // Deep emerald surface
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  cardLazy: {
    backgroundColor: '#1A1625', // Deep violet surface
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  cardUrgent: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  timerBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  timerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  timerTextUrgent: {
    color: '#EF4444',
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginRight: 8,
  },
  cashPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  cashPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34D399',
  },

  // Vertical Route Timeline
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 10,
  },
  timelineCol: {
    alignItems: 'center',
    width: 14,
    marginRight: 10,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  timelineLine: {
    width: 2,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 2,
  },
  dropoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  stationsCol: {
    flex: 1,
  },
  stationRow: {
    justifyContent: 'center',
  },
  stationLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  stationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  dropoffHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },

  // Reward Box
  qpRewardBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E170A',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginLeft: 8,
  },
  qpRewardAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FCD34D',
    marginTop: 2,
  },

  // Notes Box
  notesBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.questerMode,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#94A3B8',
  },

  // Slide to Claim Slider
  sliderContainer: {
    marginTop: 2,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sliderTrack: {
    flex: 1,
    backgroundColor: '#0A1510',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sliderHintText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#10B981',
  },
  sliderThumb: {
    position: 'absolute',
    left: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  acceptedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  acceptedBannerText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#10B981',
  },

  // Lazy Mode Action
  lazyActionRow: {
    marginTop: 4,
  },
  detailsBtn: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C4B5FD',
  },
});
