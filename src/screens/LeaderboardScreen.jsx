/**
 * LeaderboardScreen — Final "Leaderboard" tab for "Quest"
 *
 * Requirements:
 * 1. Top section: User Profile Card showing Reliability Score (98%),
 *    Quests Completed (24), and unlocked badges ("Night Owl Runner", "Hostel Saviour").
 * 2. Middle section: "Inter-Hostel Leaderboard" comparing total points across hostels
 *    (BH-1, BH-2, BH-3, GH-1) and a top 5 weekly student runners list.
 * 3. Bottom section: "Redeem QP Store" where users can swap points for
 *    "Free Delivery Pass (150 QP)" or "Night Canteen ₹50 Voucher (500 QP)".
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';

// Hostels data comparing total points
const HOSTEL_RANKINGS = [
  {
    id: 'bh2',
    name: 'BH-2 (Boy’s Hostel 2)',
    shortName: 'BH-2',
    points: 18450,
    deliveries: 412,
    rank: 1,
    medal: '#1',
    isUserHostel: true,
    sharePercent: 32,
  },
  {
    id: 'bh1',
    name: 'BH-1 (Boy’s Hostel 1)',
    shortName: 'BH-1',
    points: 16820,
    deliveries: 380,
    rank: 2,
    medal: '#2',
    isUserHostel: false,
    sharePercent: 29,
  },
  {
    id: 'gh1',
    name: 'GH-1 (Girl’s Hostel 1)',
    shortName: 'GH-1',
    points: 14310,
    deliveries: 325,
    rank: 3,
    medal: '#3',
    isUserHostel: false,
    sharePercent: 24,
  },
  {
    id: 'bh3',
    name: 'BH-3 (Boy’s Hostel 3)',
    shortName: 'BH-3',
    points: 11940,
    deliveries: 268,
    rank: 4,
    medal: '#4',
    isUserHostel: false,
    sharePercent: 15,
  },
];

// Top 5 weekly student runners
const TOP_RUNNERS = [
  {
    rank: 1,
    name: 'Siddharth Varma',
    room: 'BH-2 • Room 318',
    qp: 2150,
    quests: 48,
    badge: 'Campus Legend',
    avatar: 'SV',
  },
  {
    rank: 2,
    name: 'Aditya Raj',
    room: 'BH-2 • Room 104',
    qp: 1890,
    quests: 41,
    badge: 'Speed Demon',
    avatar: 'AR',
  },
  {
    rank: 3,
    name: 'Kunal Mehra',
    room: 'BH-1 • Room 202',
    qp: 1640,
    quests: 36,
    badge: 'Midnight Hero',
    avatar: 'KM',
  },
  {
    rank: 4,
    name: 'Tushar Garg',
    room: 'BH-2 • Room 405',
    qp: 1220,
    quests: 29,
    badge: 'Gate Runner',
    avatar: 'TG',
  },
  {
    rank: 5,
    name: 'Harshit Joshi',
    room: 'BH-3 • Room 119',
    qp: 980,
    quests: 22,
    badge: 'Lab Courier',
    avatar: 'HJ',
  },
];

// Redeem Store perks
const STORE_PERKS = [
  {
    id: 'perk_pass',
    title: 'Free Delivery Pass',
    desc: 'Waives platform & runner tip fees on your next 3 Lazy Mode snack orders.',
    costQP: 150,
    iconName: 'ticket-outline',
    tag: 'Popular',
    codePrefix: 'PASS-FREE',
  },
  {
    id: 'perk_canteen',
    title: 'Night Canteen ₹50 Voucher',
    desc: 'Instant ₹50 off on orders above ₹100 at Nescafe, Maggi Booth or Roll Counter.',
    costQP: 500,
    iconName: 'restaurant-outline',
    tag: 'Best Value',
    codePrefix: 'CANTEEN-50',
  },
  {
    id: 'perk_print',
    title: 'Stationery 25-Page Xerox Pass',
    desc: 'Free black & white photocopies or printouts at Central Stationery Shop.',
    costQP: 80,
    iconName: 'print-outline',
    tag: 'Academics',
    codePrefix: 'XEROX-25',
  },
];

export default function LeaderboardScreen() {
  const { userProfile, deductQP } = useQuestMode();

  // Redemption state
  const [redeemedPerks, setRedeemedPerks] = useState({});
  const [voucherModal, setVoucherModal] = useState(null);
  const [insufficientModal, setInsufficientModal] = useState(null);

  const handleRedeem = (perk) => {
    const success = deductQP(perk.costQP);
    if (!success) {
      setInsufficientModal({
        cost: perk.costQP,
        current: userProfile?.qpBalance || 0,
        title: perk.title,
      });
      return;
    }

    const uniqueCode = `${perk.codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setRedeemedPerks((prev) => ({ ...prev, [perk.id]: true }));
    setVoucherModal({
      perk,
      code: uniqueCode,
      deducted: perk.costQP,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar with live wallet balance */}
      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP SECTION: User Profile Card */}
        <View style={styles.profileCard}>
          {/* Header row */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(userProfile?.name || 'M')[0]}
              </Text>
              <View style={styles.verifiedOnlineDot} />
            </View>

              <View style={styles.profileMeta}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{userProfile?.name || 'Mohit'}</Text>
                <View style={styles.tierPill}>
                  <Ionicons name="shield-outline" size={12} color="#B45309" style={{ marginRight: 4 }} />
                  <Text style={styles.tierPillText}>Silver Quester</Text>
                </View>
              </View>
              <Text style={styles.profileRoom}>{userProfile?.hostelBadge || 'BH-2 • Room 214'}</Text>
              <Text style={styles.profileRankSubtitle}>
                Rank #14 in BH-2 • Top 8% active campus courier
              </Text>
            </View>
          </View>

          {/* Key Metrics Row */}
          <View style={styles.metricsGrid}>
            {/* Reliability Score */}
            <View style={styles.metricItem}>
              <View style={styles.metricTop}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.metricValueGreen}>98%</Text>
              </View>
              <Text style={styles.metricLabel}>Reliability Score</Text>
              <Text style={styles.metricSub}>0 drops cancelled</Text>
            </View>

            {/* Quests Completed */}
            <View style={styles.metricItem}>
              <View style={styles.metricTop}>
                <Ionicons name="flash-outline" size={14} color={Colors.textPrimary} style={{ marginRight: 4 }} />
                <Text style={styles.metricValue}>24</Text>
              </View>
              <Text style={styles.metricLabel}>Quests Completed</Text>
              <Text style={styles.metricSub}>All on-time</Text>
            </View>

            {/* Total QP Wallet */}
            <View style={styles.metricItem}>
              <View style={styles.metricTop}>
                <Ionicons name="sparkles" size={14} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.metricValueGold}>{userProfile?.qpBalance ?? 450}</Text>
              </View>
              <Text style={styles.metricLabel}>Quest Points</Text>
              <Text style={styles.metricSub}>Ready to redeem</Text>
            </View>
          </View>

          {/* Unlocked Badges */}
          <View style={styles.badgesContainer}>
            <Text style={styles.badgesTitle}>UNLOCKED ACHIEVEMENTS</Text>
            <View style={styles.badgesRow}>
              {/* Badge 1: Night Owl Runner */}
              <View style={styles.badgePill}>
                <Ionicons name="moon-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
                <View>
                  <Text style={styles.badgeName}>Night Owl Runner</Text>
                  <Text style={styles.badgeDesc}>10+ drops past 1 AM</Text>
                </View>
              </View>

              {/* Badge 2: Hostel Saviour */}
              <View style={styles.badgePill}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#059669" style={{ marginRight: 6 }} />
                <View>
                  <Text style={styles.badgeName}>Hostel Saviour</Text>
                  <Text style={styles.badgeDesc}>15+ exam week runs</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. MIDDLE SECTION: Inter-Hostel Leaderboard */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Inter-Hostel Leaderboard</Text>
            <Text style={styles.sectionSubtitle}>
              Total Quest Points accumulated this semester
            </Text>
          </View>
          <View style={styles.weeklyResetPill}>
            <Text style={styles.weeklyResetText}>Week 8</Text>
          </View>
        </View>

        {/* Hostel Rankings Breakdown Cards */}
        <View style={styles.hostelRankingsCard}>
          {HOSTEL_RANKINGS.map((hostel) => (
            <View
              key={hostel.id}
              style={[
                styles.hostelRow,
                hostel.isUserHostel && styles.hostelRowHighlighted,
              ]}
            >
              <View style={styles.hostelRankCol}>
                <Text style={styles.hostelMedal}>{hostel.medal}</Text>
              </View>

              <View style={styles.hostelInfoCol}>
                <View style={styles.hostelNameRow}>
                  <Text style={styles.hostelNameText}>{hostel.shortName}</Text>
                  {hostel.isUserHostel && (
                    <View style={styles.yourHostelTag}>
                      <Text style={styles.yourHostelText}>YOUR HOSTEL • #1</Text>
                    </View>
                  )}
                </View>
                {/* Progress bar visual */}
                <View style={styles.hostelBarBg}>
                  <View
                    style={[
                      styles.hostelBarFill,
                      {
                        width: `${hostel.sharePercent * 2.8}%`,
                        backgroundColor: hostel.isUserHostel
                          ? '#10B981'
                          : '#F59E0B',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.hostelSubtext}>
                  {hostel.deliveries} deliveries this month
                </Text>
              </View>

              <View style={styles.hostelPointsCol}>
                <Text style={styles.hostelPointsText}>
                  {hostel.points.toLocaleString()}
                </Text>
                <Text style={styles.hostelPointsLabel}>QP</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top 5 Weekly Student Runners List */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top 5 Weekly Student Runners</Text>
            <Text style={styles.sectionSubtitle}>
              Leading delivery heroes across campus
            </Text>
          </View>
        </View>

        <View style={styles.runnersCard}>
          {TOP_RUNNERS.map((runner) => (
            <View key={runner.rank} style={styles.runnerRow}>
              <View style={styles.runnerRankCol}>
                <Text style={styles.runnerRankText}>#{runner.rank}</Text>
              </View>

              <View style={styles.runnerAvatar}>
                <Text style={styles.runnerAvatarText}>{runner.avatar}</Text>
              </View>

              <View style={styles.runnerInfoCol}>
                <View style={styles.runnerNameRow}>
                  <Text style={styles.runnerName}>{runner.name}</Text>
                </View>
                <Text style={styles.runnerRoom}>{runner.room}</Text>
                <Text style={styles.runnerBadge}>{runner.badge}</Text>
              </View>

              <View style={styles.runnerQPCol}>
                <Text style={styles.runnerQPAmount}>{runner.qp} QP</Text>
                <Text style={styles.runnerQuestCount}>{runner.quests} runs</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 3. BOTTOM SECTION: Redeem QP Store */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Redeem QP Store</Text>
            <Text style={styles.sectionSubtitle}>
              Swap your hard-earned points for real campus perks
            </Text>
          </View>
          <View style={styles.storeWalletPill}>
            <Ionicons name="sparkles" size={11} color="#B45309" style={{ marginRight: 4 }} />
            <Text style={styles.storeWalletText}>
              {userProfile?.qpBalance ?? 450} QP Available
            </Text>
          </View>
        </View>

        <View style={styles.storeContainer}>
          {STORE_PERKS.map((perk) => {
            const isRedeemed = redeemedPerks[perk.id];

            return (
              <View key={perk.id} style={styles.perkCard}>
                <View style={styles.perkTopRow}>
                  <View style={styles.perkIconWrapper}>
                    <Ionicons name={perk.iconName} size={22} color={Colors.textPrimary} />
                  </View>
                  <View style={styles.perkInfo}>
                    <View style={styles.perkTitleRow}>
                      <Text style={styles.perkTitle}>{perk.title}</Text>
                      <View style={styles.perkTagBadge}>
                        <Text style={styles.perkTagText}>{perk.tag}</Text>
                      </View>
                    </View>
                    <Text style={styles.perkDesc}>{perk.desc}</Text>
                  </View>
                </View>

                <View style={styles.perkDivider} />

                <View style={styles.perkFooter}>
                  <View style={styles.perkCostGroup}>
                    <Ionicons name="sparkles" size={13} color="#D97706" style={{ marginRight: 4 }} />
                    <Text style={styles.perkCostAmount}>{perk.costQP} QP</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.redeemBtn,
                      isRedeemed && styles.redeemedBtn,
                    ]}
                    onPress={() => handleRedeem(perk)}
                    disabled={isRedeemed}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.redeemBtnText,
                        isRedeemed && styles.redeemedBtnText,
                      ]}
                    >
                      {isRedeemed ? 'Redeemed' : `Redeem (${perk.costQP} QP)`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Voucher Confirmation Modal */}
      <Modal
        visible={!!voucherModal}
        animationType="fade"
        transparent
        onRequestClose={() => setVoucherModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voucherCard}>
            <Text style={styles.voucherEmoji}>{voucherModal?.perk?.emoji} 🎉</Text>
            <Text style={styles.voucherTitle}>Reward Redeemed!</Text>
            <Text style={styles.voucherSubtitle}>
              You have successfully claimed {voucherModal?.perk?.title}. Show this voucher code at the vendor or apply during checkout.
            </Text>

            {/* Voucher Code Box */}
            <View style={styles.voucherCodeBox}>
              <Text style={styles.voucherCodeLabel}>VOUCHER CODE</Text>
              <Text style={styles.voucherCodeText}>{voucherModal?.code}</Text>
              <Text style={styles.voucherExpiryText}>Valid for 7 days • Single use</Text>
            </View>

            {/* Wallet update summary */}
            <View style={styles.voucherSummary}>
              <Text style={styles.summaryDeduct}>
                -{voucherModal?.deducted} QP Deducted
              </Text>
              <Text style={styles.summaryBalance}>
                Remaining Balance: {userProfile?.qpBalance ?? 450} QP
              </Text>
            </View>

            <TouchableOpacity
              style={styles.voucherCloseBtn}
              onPress={() => setVoucherModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.voucherCloseText}>Done & Save Voucher</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Insufficient QP Modal */}
      <Modal
        visible={!!insufficientModal}
        animationType="fade"
        transparent
        onRequestClose={() => setInsufficientModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voucherCard}>
            <Text style={styles.voucherEmoji}>🪙 ⚠️</Text>
            <Text style={styles.voucherTitle}>Need More Points</Text>
            <Text style={styles.voucherSubtitle}>
              "{insufficientModal?.title}" costs {insufficientModal?.cost} QP, but you currently have {insufficientModal?.current} QP.
            </Text>

            <View style={styles.voucherCodeBox}>
              <Text style={styles.earnMoreText}>
                🚀 Hop into Quester Mode in the Home Feed to accept student delivery bounties and earn +40 to +60 QP per run!
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.voucherCloseBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => setInsufficientModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.voucherCloseText}>Got it, Back to Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
  },

  // 1. User Profile Card
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Colors.shadowSm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    position: 'relative',
  },
  avatarInitials: {
    color: '#B45309',
    fontSize: 20,
    fontWeight: '800',
  },
  verifiedOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileMeta: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tierPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  profileRoom: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  profileRankSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    gap: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricEmoji: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricValueGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  metricValueGold: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // Badges container
  badgesContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  badgesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeDesc: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // 2. Inter-Hostel Leaderboard Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  weeklyResetPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weeklyResetText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  hostelRankingsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: 12,
    ...Colors.shadowSm,
  },
  hostelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  hostelRowHighlighted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  hostelRankCol: {
    width: 28,
    alignItems: 'center',
  },
  hostelMedal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  hostelInfoCol: {
    flex: 1,
  },
  hostelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  hostelNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  yourHostelTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  yourHostelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  hostelBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 3,
  },
  hostelBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hostelSubtext: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  hostelPointsCol: {
    alignItems: 'flex-end',
    minWidth: 64,
  },
  hostelPointsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  hostelPointsLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Runners List Card
  runnersCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: 8,
    ...Colors.shadowSm,
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  runnerRankCol: {
    width: 26,
    alignItems: 'center',
  },
  runnerRankText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  runnerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  runnerAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  runnerInfoCol: {
    flex: 1,
  },
  runnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runnerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  runnerRoom: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  runnerBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 2,
  },
  runnerQPCol: {
    alignItems: 'flex-end',
  },
  runnerQPAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  runnerQuestCount: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // 3. Redeem QP Store
  storeWalletPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  storeWalletText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  storeContainer: {
    gap: 12,
  },
  perkCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Colors.shadowSm,
  },
  perkTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  perkIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  perkEmoji: {
    fontSize: 20,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  perkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  perkTagBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  perkTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  perkDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  perkDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  perkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  perkCostGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  perkCostCoin: {
    fontSize: 13,
  },
  perkCostAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  redeemBtn: {
    backgroundColor: Colors.lazyMode, // Purple store button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  redeemedBtn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  redeemedBtnText: {
    color: '#059669',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  voucherCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    ...Colors.shadowLg,
  },
  voucherEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  voucherTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 6,
  },
  voucherSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  voucherCodeBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    marginBottom: 14,
  },
  voucherCodeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  voucherCodeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
    marginBottom: 4,
  },
  voucherExpiryText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  voucherSummary: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  summaryDeduct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  summaryBalance: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  earnMoreText: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 17,
  },
  voucherCloseBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  voucherCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
