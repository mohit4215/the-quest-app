/**
 * RewardsScreen — Gamification & Perks Hub
 *
 * Sections:
 *  1. AppHeader with current QP
 *  2. Hero QP card — total balance + animated level progress bar
 *  3. Level journey tracker (all 6 tiers)
 *  4. Stats grid (quests done, rank, streak)
 *  5. Redeemable shop perks (cards with Redeem button + state)
 *  6. QP activity history
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../constants';
import { AppHeader, SectionHeader, Card, Divider } from '../components/common';
import { RewardHistoryItem } from '../components/quest';
import {
  CURRENT_USER,
  REWARD_HISTORY,
  SHOP_PERKS,
  LEVELS,
} from '../data/mockData';

export default function RewardsScreen() {
  const [qpBalance, setQpBalance] = useState(CURRENT_USER.qpBalance);
  const [redeemedIds, setRedeemedIds] = useState([]);

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: CURRENT_USER.levelProgress,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const currentLevelIndex = LEVELS.findIndex(
    (l) => qpBalance >= l.minQP && qpBalance < l.maxQP
  );
  const currentLevel = LEVELS[currentLevelIndex] ?? LEVELS[LEVELS.length - 1];
  const nextLevel = LEVELS[currentLevelIndex + 1];

  function handleRedeem(perk) {
    if (redeemedIds.includes(perk.id)) return;
    if (qpBalance < perk.cost) {
      Alert.alert(
        'Not enough QP',
        `You need ${perk.cost} QP but only have ${qpBalance} QP.`
      );
      return;
    }
    Alert.alert(
      'Redeem Perk?',
      `Spend ${perk.cost} QP for "${perk.offer}" at ${perk.shop}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            setQpBalance((prev) => prev - perk.cost);
            setRedeemedIds((prev) => [...prev, perk.id]);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Rewards"
        subtitle="Your QP wallet & perks"
        qpBalance={qpBalance}
        showQP
        onNotifPress={() => {}}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero QP Card ────────────────────────────────────── */}
        <LinearGradient
          colors={['#FF8F00', '#FFB300', '#FFD54F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative circle */}
          <View style={styles.heroCircle} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Total Quest Points</Text>
              <Text style={styles.heroBalance}>{qpBalance.toLocaleString()}</Text>
              <Text style={styles.heroUnit}>QP</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelEmoji}>{currentLevel.emoji}</Text>
              <Text style={styles.levelName}>{currentLevel.name}</Text>
            </View>
          </View>

          {/* Progress bar to next level */}
          {nextLevel && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>
                  {qpBalance.toLocaleString()} / {nextLevel.minQP.toLocaleString()} QP
                </Text>
                <Text style={styles.progressLabel}>
                  {nextLevel.name} {nextLevel.emoji}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                {nextLevel.minQP - qpBalance} QP to unlock {nextLevel.name}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Stats Grid ──────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          <StatCard icon="⚡" value={CURRENT_USER.totalQuestsCompleted} label="Quests Done" color={Colors.primary} />
          <StatCard icon="📋" value={CURRENT_USER.totalQuestsPosted} label="Quests Posted" color={Colors.info} />
          <StatCard icon="🔥" value="7" label="Day Streak" color={Colors.error} />
          <StatCard icon="🏆" value="#12" label="Campus Rank" color={Colors.gold} />
        </View>

        {/* ── Level Journey ───────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Level Journey" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.levelRow}
          >
            {LEVELS.map((level, index) => {
              const isUnlocked = qpBalance >= level.minQP;
              const isCurrent = index === currentLevelIndex;
              return (
                <LevelTile
                  key={level.name}
                  level={level}
                  isUnlocked={isUnlocked}
                  isCurrent={isCurrent}
                  index={index}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* ── Shop Perks ───────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Redeem at Campus Shops" />
          <View style={styles.perksGrid}>
            {SHOP_PERKS.map((perk) => (
              <PerkCard
                key={perk.id}
                perk={perk}
                canAfford={qpBalance >= perk.cost}
                redeemed={redeemedIds.includes(perk.id)}
                onRedeem={() => handleRedeem(perk)}
              />
            ))}
          </View>
        </View>

        {/* ── Activity History ─────────────────────────────────── */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title="QP Activity" />
          <Card padding="none" style={styles.historyCard}>
            {REWARD_HISTORY.map((item, i) => (
              <React.Fragment key={item.id}>
                <RewardHistoryItem item={item} />
                {i < REWARD_HISTORY.length - 1 && <Divider style={styles.noDividerMargin} />}
              </React.Fragment>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    ...Shadow.sm,
  },
  icon: { fontSize: 20, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  label: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },
});

// ─── LevelTile ────────────────────────────────────────────────────────────────
function LevelTile({ level, isUnlocked, isCurrent, index }) {
  return (
    <View style={[levelStyles.tile, isCurrent && levelStyles.tileCurrent, !isUnlocked && levelStyles.tileLocked]}>
      <Text style={levelStyles.emoji}>{isUnlocked ? level.emoji : '🔒'}</Text>
      <Text style={[levelStyles.name, !isUnlocked && levelStyles.lockedText]}>{level.name}</Text>
      <Text style={[levelStyles.range, !isUnlocked && levelStyles.lockedText]}>
        {level.minQP === 0 ? '0' : level.minQP.toLocaleString()}
        {level.maxQP === Infinity ? '+' : `–${level.maxQP.toLocaleString()}`} QP
      </Text>
      {isCurrent && (
        <View style={levelStyles.currentTag}>
          <Text style={levelStyles.currentTagText}>YOU</Text>
        </View>
      )}
    </View>
  );
}

const levelStyles = StyleSheet.create({
  tile: {
    width: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  tileCurrent: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldLight,
  },
  tileLocked: {
    opacity: 0.5,
  },
  emoji: { fontSize: 26, marginBottom: Spacing.xs },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 3,
  },
  range: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  lockedText: { color: Colors.textMuted },
  currentTag: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentTagText: { fontSize: 9, fontWeight: '800', color: Colors.textPrimary },
});

// ─── PerkCard ─────────────────────────────────────────────────────────────────
function PerkCard({ perk, canAfford, redeemed, onRedeem }) {
  return (
    <View style={[perkStyles.card, redeemed && perkStyles.cardRedeemed, !perk.available && perkStyles.cardUnavailable]}>
      <View style={perkStyles.top}>
        <Text style={perkStyles.emoji}>{perk.emoji}</Text>
        <View style={perkStyles.info}>
          <Text style={perkStyles.shop}>{perk.shop}</Text>
          <Text style={perkStyles.offer} numberOfLines={2}>{perk.offer}</Text>
        </View>
      </View>

      <View style={perkStyles.bottom}>
        <View style={perkStyles.costRow}>
          <Text style={perkStyles.costIcon}>🪙</Text>
          <Text style={perkStyles.cost}>{perk.cost} QP</Text>
        </View>

        <TouchableOpacity
          style={[
            perkStyles.redeemBtn,
            redeemed && perkStyles.redeemedBtn,
            (!canAfford || !perk.available) && !redeemed && perkStyles.disabledBtn,
          ]}
          onPress={onRedeem}
          disabled={redeemed || !perk.available}
          activeOpacity={0.8}
        >
          <Text style={[
            perkStyles.redeemText,
            redeemed && perkStyles.redeemedText,
            (!canAfford || !perk.available) && !redeemed && perkStyles.disabledText,
          ]}>
            {redeemed ? '✓ Redeemed' : !perk.available ? 'Unavailable' : !canAfford ? 'Need more QP' : 'Redeem'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const perkStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardRedeemed: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  cardUnavailable: {
    opacity: 0.6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  shop: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  offer: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, lineHeight: 18 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costIcon: { fontSize: 13 },
  cost: { fontSize: 14, fontWeight: '800', color: Colors.goldDark },
  redeemBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  redeemedBtn: { backgroundColor: Colors.successLight },
  disabledBtn: { backgroundColor: Colors.accent },
  redeemText: { fontSize: 12, fontWeight: '700', color: Colors.textInverse },
  redeemedText: { color: Colors.success },
  disabledText: { color: Colors.textMuted },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Layout.tabBarHeight + Spacing.xl },

  heroCard: {
    margin: Spacing.base,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.lg,
  },
  heroCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -60,
    right: -40,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  heroLabel: { fontSize: 12, color: 'rgba(0,0,0,0.55)', fontWeight: '600', marginBottom: 3 },
  heroBalance: { fontSize: 52, fontWeight: '900', color: Colors.textPrimary, lineHeight: 54, letterSpacing: -2 },
  heroUnit: { fontSize: 16, fontWeight: '700', color: 'rgba(0,0,0,0.5)', marginTop: -4 },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 90,
    ...Shadow.sm,
  },
  levelEmoji: { fontSize: 26, marginBottom: 4 },
  levelName: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  progressSection: { marginTop: Spacing.xs },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 10, color: 'rgba(0,0,0,0.55)', fontWeight: '600' },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.full,
    opacity: 0.7,
  },
  progressHint: { fontSize: 10, color: 'rgba(0,0,0,0.5)', fontWeight: '500' },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  section: { paddingTop: Spacing.lg },
  lastSection: { paddingBottom: Spacing.base },

  levelRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },

  perksGrid: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },

  historyCard: { marginHorizontal: Spacing.base, overflow: 'hidden' },
  noDividerMargin: { marginVertical: 0 },
});
