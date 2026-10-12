/**
 * ActiveQuestScreen — Placeholder screen for "Active Quest"
 * Tracking live tasks, micro-deliveries, and reward redemption.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';

export default function ActiveQuestScreen() {
  const { isLazyMode, accentColor, accentBg, accentBorder } = useQuestMode();

  return (
    <View style={styles.container}>
      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Quest Card */}
        <View style={[styles.activeCard, { borderColor: accentBorder }]}>
          <View style={styles.activeHeader}>
            <View style={[styles.statusBadge, { backgroundColor: accentBg }]}>
              <Text style={[styles.statusText, { color: accentColor }]}>
                ● IN PROGRESS
              </Text>
            </View>
            <Text style={styles.etaText}>ETA: 12 mins</Text>
          </View>

          <Text style={styles.questTitle}>
            {isLazyMode
              ? 'Cold Coffee & Samosa Delivery'
              : 'Delivering to BH-2 Room 214'}
          </Text>
          <Text style={styles.questSubtitle}>
            {isLazyMode
              ? 'Picked up by Quester: Priya (3rd Year, BH-1)'
              : 'Pickup from Canteen #2 • Drop at BH-2 2nd Floor'}
          </Text>

          {/* Stepper / Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.stepLabel, { color: Colors.textPrimary }]}>Order Placed</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: accentColor }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.stepLabel, { color: Colors.textPrimary }]}>Picked Up</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: '#262D3D' }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: '#262D3D' }]} />
              <Text style={styles.stepLabel}>Delivered</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>💬 Chat Hosteller</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: accentColor }]}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                {isLazyMode ? 'Track Live' : 'Complete Delivery'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* History / Placeholders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Completed Quests</Text>
        </View>

        <View style={styles.historyCard}>
          <View style={styles.historyRow}>
            <View>
              <Text style={styles.historyTitle}>Midnight Tea & Biscuit Run</Text>
              <Text style={styles.historyDate}>Yesterday, 11:45 PM</Text>
            </View>
            <Text style={styles.historyReward}>+50 QP</Text>
          </View>
        </View>

        {/* Placeholder Shell Note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>⚔️ Active Quest Shell</Text>
          <Text style={styles.infoCardText}>
            This placeholder tab manages real-time delivery status, OTP validation upon delivery, and instant QP transfer into hosteller wallets.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #0D0F14
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 96,
  },
  activeCard: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
  },
  questTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  questSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginTop: -16,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#1E2330',
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  secondaryBtnText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  historyReward: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  infoCard: {
    backgroundColor: '#161922',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#262D3D',
    borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
