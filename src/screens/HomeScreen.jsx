/**
 * HomeScreen — Quest App Dashboard
 *
 * Sections (top to bottom):
 *  1. AppHeader with QP balance
 *  2. Greeting card with user stats
 *  3. "Talk to a Senior" HeroBanner
 *  4. Action Grid (Post a Quest / Do a Quest)
 *  5. Community Q&A threads
 *  6. Reward history
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../constants';
import {
  AppHeader,
  SectionHeader,
  Card,
  Divider,
} from '../components/common';
import {
  HeroBanner,
  ActionGridItem,
  QAThreadItem,
  RewardHistoryItem,
} from '../components/quest';

import {
  CURRENT_USER,
  QA_THREADS,
  REWARD_HISTORY,
  BOUNTY_QUESTS,
} from '../data/mockData';

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [qpBalance, setQpBalance] = useState(CURRENT_USER.qpBalance);

  const openQuestsCount = BOUNTY_QUESTS.filter((q) => q.status === 'open').length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  function navigateTab(tabName) {
    navigation.navigate(tabName);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ────────────────────────────────────────── */}
      <AppHeader
        title="Quest"
        subtitle="AKGEC Campus"
        qpBalance={qpBalance}
        showQP
        onNotifPress={() => {}}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── Greeting Card ─────────────────────────────────── */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingHello}>Good afternoon 👋</Text>
            <Text style={styles.greetingName}>{CURRENT_USER.name}</Text>
            <Text style={styles.greetingMeta}>
              {CURRENT_USER.branch} · {CURRENT_USER.hostel}
            </Text>
          </View>

          <View style={styles.greetingStats}>
            <StatPill label="Done" value={CURRENT_USER.totalQuestsCompleted} icon="⚡" />
            <StatPill label="Posted" value={CURRENT_USER.totalQuestsPosted} icon="📋" />
          </View>
        </View>

        {/* ── Quick QP Banner ───────────────────────────────── */}
        <View style={styles.qpBannerWrap}>
          <QPSummaryBanner
            balance={qpBalance}
            level={CURRENT_USER.level}
            progress={CURRENT_USER.levelProgress}
            onPress={() => navigateTab('Rewards')}
          />
        </View>

        {/* ── Hero Banner: Talk to a Senior ─────────────────── */}
        <View style={styles.section}>
          <HeroBanner onPress={() => navigateTab('Forum')} />
        </View>

        {/* ── Action Grid ───────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="What's your Quest today?" />
          <View style={styles.actionGrid}>
            <ActionGridItem
              icon="🗺️"
              title="Do a Quest"
              subtitle="Pick up nearby orders & earn QP"
              gradientColors={['#1565C0', '#0D47A1']}
              badge={`${openQuestsCount} open`}
              onPress={() => navigateTab('DoQuest')}
              style={styles.actionGridItem}
            />
            <ActionGridItem
              icon="📋"
              title="Post a Quest"
              subtitle="Request something from Sachi Street"
              gradientColors={['#FF8F00', '#FFB300']}
              onPress={() => navigateTab('PostQuest')}
              style={styles.actionGridItem}
            />
          </View>
        </View>

        {/* ── Live Activity Strip ───────────────────────────── */}
        <LiveActivityStrip questCount={openQuestsCount} />

        {/* ── Community Q&A ─────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Community Q&A"
            onAction={() => navigateTab('Forum')}
          />
          <Card padding="none" style={styles.listCard}>
            {QA_THREADS.map((thread, index) => (
              <React.Fragment key={thread.id}>
                <QAThreadItem
                  thread={thread}
                  onPress={() => navigateTab('Forum')}
                />
                {index < QA_THREADS.length - 1 && <Divider style={styles.noDividerMargin} />}
              </React.Fragment>
            ))}
            <TouchableOpacity
              style={styles.seeMoreBtn}
              onPress={() => navigateTab('Forum')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeMoreText}>View all discussions  →</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* ── Reward History ────────────────────────────────── */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader
            title="QP Activity"
            onAction={() => navigateTab('Rewards')}
          />
          <Card padding="none" style={styles.listCard}>
            {REWARD_HISTORY.map((item, index) => (
              <React.Fragment key={item.id}>
                <RewardHistoryItem item={item} />
                {index < REWARD_HISTORY.length - 1 && (
                  <Divider style={styles.noDividerMargin} />
                )}
              </React.Fragment>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon, value, label }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 60,
  },
  icon: { fontSize: 16, marginBottom: 1 },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 20,
  },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
});

// ── QP Summary Banner ─────────────────────────────────────────────────────────
function QPSummaryBanner({ balance, level, progress, onPress }) {
  return (
    <TouchableOpacity
      style={qpBannerStyles.container}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${balance} Quest Points, ${level}`}
    >
      <View style={qpBannerStyles.left}>
        <Text style={qpBannerStyles.coinIcon}>🪙</Text>
        <View>
          <Text style={qpBannerStyles.balance}>{balance.toLocaleString()} QP</Text>
          <Text style={qpBannerStyles.level}>{level}</Text>
        </View>
      </View>

      <View style={qpBannerStyles.right}>
        <View style={qpBannerStyles.progressTrack}>
          <View style={[qpBannerStyles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={qpBannerStyles.progressLabel}>
          {Math.round(progress * 100)}% to next level
        </Text>
      </View>

      <Text style={qpBannerStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const qpBannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  coinIcon: { fontSize: 26 },
  balance: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.goldDark,
    letterSpacing: -0.3,
  },
  level: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
    marginTop: 1,
  },
  right: {
    flex: 1,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#FFE082',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    color: Colors.goldDark,
    fontWeight: '300',
  },
});

// ── Live Activity Strip ───────────────────────────────────────────────────────
function LiveActivityStrip({ questCount }) {
  return (
    <View style={liveStyles.strip}>
      <View style={liveStyles.dot} />
      <Text style={liveStyles.text}>
        <Text style={liveStyles.bold}>{questCount} quests</Text> posted in the last 30 minutes near Sachi Street
      </Text>
    </View>
  );
}

const liveStyles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 12,
    color: Colors.info,
    flex: 1,
    lineHeight: 17,
  },
  bold: {
    fontWeight: '700',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
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

  // Greeting card
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greetingLeft: { flex: 1 },
  greetingHello: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingName: {
    ...Typography.headingMd,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  greetingMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  greetingStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // QP banner
  qpBannerWrap: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
  },

  // Sections
  section: {
    paddingTop: Spacing.lg,
  },
  lastSection: {
    paddingBottom: Spacing.base,
  },

  // Action grid
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    minHeight: 150,
  },
  actionGridItem: {
    flex: 1,
  },

  // List card
  listCard: {
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  noDividerMargin: {
    marginVertical: 0,
  },

  // See more
  seeMoreBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  seeMoreText: {
    ...Typography.label,
    color: Colors.primary,
    fontSize: 13,
  },
});
