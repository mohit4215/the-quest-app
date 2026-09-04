/**
 * DoQuestScreen — Courier Mode
 *
 * Layout:
 *  1. AppHeader with live QP balance
 *  2. Filter tabs (All / Food / Stationery / Beverages)
 *  3. RadarScanner — animated campus hotspot map
 *  4. "Quests Near You" heading with count badge
 *  5. Scrollable BountyCard feed with claim state management
 *  6. Empty state when all quests are claimed
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../constants';
import { AppHeader, SectionHeader, EmptyState } from '../components/common';
import { RadarScanner, BountyCard } from '../components/quest';
import { BOUNTY_QUESTS, CURRENT_USER } from '../data/mockData';

// ─── Filter categories ────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all', label: 'All', icon: '⚡' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'beverages', label: 'Beverages', icon: '🥤' },
  { id: 'stationery', label: 'Stationery', icon: '📝' },
  { id: 'other', label: 'Other', icon: '📦' },
];

// Simple category inference from item text
function inferCategory(item = '') {
  const t = item.toLowerCase();
  if (/maggi|samosa|chai|tea|coffee|biryani|paratha|food|dhaba/.test(t)) return 'food';
  if (/frooti|red bull|juice|cold drink|pepsi|cola|water|beverage/.test(t)) return 'beverages';
  if (/photocopy|notebook|pen|pencil|xerox|stationery|paper/.test(t)) return 'stationery';
  return 'other';
}

export default function DoQuestScreen() {
  const [quests, setQuests] = useState(BOUNTY_QUESTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [qpBalance, setQpBalance] = useState(CURRENT_USER.qpBalance);
  const [earnedFlash, setEarnedFlash] = useState(null); // shows "+XX QP" toast

  // Claim a quest: flip its status and credit QP
  const handleClaim = useCallback((questId) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId ? { ...q, status: 'claimed' } : q
      )
    );
    const quest = quests.find((q) => q.id === questId);
    if (quest) {
      setQpBalance((prev) => prev + quest.bounty);
      setEarnedFlash(`+${quest.bounty} QP earned!`);
      setTimeout(() => setEarnedFlash(null), 2500);
    }
  }, [quests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      // Reset all to open on pull-refresh (simulates live data reload)
      setQuests(BOUNTY_QUESTS.map((q) => ({ ...q, status: 'open' })));
      setRefreshing(false);
    }, 1400);
  }, []);

  // Filtered quest list
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return quests;
    return quests.filter((q) => inferCategory(q.item) === activeFilter);
  }, [quests, activeFilter]);

  const openCount = filtered.filter((q) => q.status === 'open').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <AppHeader
        title="Do a Quest"
        subtitle="Courier Mode · AKGEC Campus"
        qpBalance={qpBalance}
        showQP
        onNotifPress={() => {}}
      />

      {/* QP earned toast */}
      {earnedFlash && <QPEarnedToast message={earnedFlash} />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryLight}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── Radar Scanner ──────────────────────────────────── */}
        <View style={styles.radarSection}>
          <View style={styles.radarHeader}>
            <Text style={styles.radarTitle}>Campus Radar</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <RadarScanner questCount={openCount} />
          <Text style={styles.radarHint}>
            Pull down to refresh · Hotspots show active quest zones
          </Text>
        </View>

        {/* ── Filter tabs ────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {FILTERS.map((f) => (
            <FilterTab
              key={f.id}
              filter={f}
              active={activeFilter === f.id}
              onPress={() => setActiveFilter(f.id)}
              count={
                f.id === 'all'
                  ? quests.filter((q) => q.status === 'open').length
                  : quests.filter(
                      (q) => inferCategory(q.item) === f.id && q.status === 'open'
                    ).length
              }
            />
          ))}
        </ScrollView>

        {/* ── Quest feed heading ─────────────────────────────── */}
        <View style={styles.feedHeader}>
          <View style={styles.feedTitleRow}>
            <Text style={styles.feedTitle}>Quests Near You</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{openCount} open</Text>
            </View>
          </View>
          <Text style={styles.feedSubtitle}>
            Sorted by distance · Sachi Street area
          </Text>
        </View>

        {/* ── Bounty Cards feed ──────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All quests claimed!"
            description="You're a true Quester. Pull down to check for new quests near Sachi Street."
            actionLabel="Refresh"
            onAction={onRefresh}
          />
        ) : (
          <View style={styles.feed}>
            {filtered.map((quest) => (
              <BountyCard
                key={quest.id}
                quest={quest}
                onClaim={handleClaim}
              />
            ))}

            {/* Bottom tip */}
            <View style={styles.feedTip}>
              <Text style={styles.feedTipText}>
                🏃 Pick up multiple quests on the same route to maximise your QP!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── FilterTab ────────────────────────────────────────────────────────────────
function FilterTab({ filter, active, onPress, count }) {
  return (
    <TouchableOpacity
      style={[styles.filterTab, active && styles.filterTabActive]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${filter.label} filter, ${count} open`}
    >
      <Text style={styles.filterIcon}>{filter.icon}</Text>
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
        {filter.label}
      </Text>
      {count > 0 && (
        <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
          <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── QPEarnedToast ─────────────────────────────────────────────────────────────
function QPEarnedToast({ message }) {
  return (
    <View style={toastStyles.toast} pointerEvents="none">
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: Colors.success,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    zIndex: 999,
    ...Shadow.lg,
  },
  text: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Layout.tabBarHeight + Spacing.xl,
  },

  // Radar section
  radarSection: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  radarTitle: {
    ...Typography.headingSm,
    color: Colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 1,
  },
  radarHint: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // Filters
  filterScroll: {
    marginTop: Spacing.base,
  },
  filterRow: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: { fontSize: 13 },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: Colors.textInverse,
  },
  filterBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  filterBadgeTextActive: {
    color: Colors.textInverse,
  },

  // Feed header
  feedHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  feedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  feedTitle: {
    ...Typography.headingSm,
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight + '22',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '55',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  feedSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '400',
  },

  // Cards feed
  feed: {
    paddingTop: Spacing.xs,
  },
  feedTip: {
    margin: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  feedTipText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
    lineHeight: 18,
  },
});
