/**
 * LeaderboardScreen — Placeholder screen for "Leaderboard"
 * Gamified rankings and hall of fame for hostel questers.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';

export default function LeaderboardScreen() {
  const { accentColor, userProfile } = useQuestMode();

  const leaders = [
    { rank: 1, name: 'Siddharth V.', room: 'BH-2 Room 318', qp: 2150, medal: '🥇' },
    { rank: 2, name: 'Aditya Raj', room: 'BH-2 Room 104', qp: 1890, medal: '🥈' },
    { rank: 3, name: 'Kunal Mehra', room: 'BH-1 Room 202', qp: 1640, medal: '🥉' },
    { rank: 4, name: 'Tushar Garg', room: 'BH-2 Room 405', qp: 1220, medal: '4' },
    { rank: 5, name: 'Harshit J.', room: 'BH-3 Room 119', qp: 980, medal: '5' },
  ];

  return (
    <View style={styles.container}>
      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Rank Card */}
        <View style={styles.myRankCard}>
          <View style={styles.myRankHeader}>
            <Text style={styles.myRankBadge}>YOUR STANDING</Text>
            <Text style={styles.myRankPoints}>{userProfile?.qpBalance ?? 450} QP</Text>
          </View>
          <View style={styles.myRankRow}>
            <View style={styles.myRankNumber}>
              <Text style={styles.myRankNumText}>#14</Text>
            </View>
            <View style={styles.myRankInfo}>
              <Text style={styles.myRankName}>{userProfile?.name ?? 'You'} (BH-2)</Text>
              <Text style={styles.myRankRoom}>{userProfile?.hostelBadge ?? 'Room 214'}</Text>
            </View>
            <View style={[styles.leagueBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.leagueText}>🏆 Silver Tier</Text>
            </View>
          </View>
        </View>

        {/* Podium / Leaderboard Table */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Weekly Hostel Champions</Text>
          <Text style={styles.sectionSubtitle}>Resets every Sunday</Text>
        </View>

        {leaders.map((item) => (
          <View key={item.rank} style={styles.leaderRow}>
            <View style={styles.rankCol}>
              <Text style={styles.medalText}>{item.medal}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.leaderName}>{item.name}</Text>
              <Text style={styles.leaderRoom}>{item.room}</Text>
            </View>
            <View style={styles.qpCol}>
              <Text style={styles.qpAmount}>{item.qp} QP</Text>
            </View>
          </View>
        ))}

        {/* Placeholder Shell Note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>📊 Leaderboard Shell</Text>
          <Text style={styles.infoCardText}>
            This placeholder tab features weekly wing competitions, wing-vs-wing showdowns (BH-1 vs BH-2), and seasonal delivery titles.
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
  myRankCard: {
    backgroundColor: '#161922',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: Spacing.lg,
  },
  myRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  myRankBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FBBF24',
  },
  myRankPoints: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FBBF24',
  },
  myRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myRankNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252B3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankNumText: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 14,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  myRankRoom: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  leagueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  leagueText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  leaderRow: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankCol: {
    width: 32,
    alignItems: 'center',
  },
  medalText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  infoCol: {
    flex: 1,
    marginLeft: 8,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  leaderRoom: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  qpCol: {
    alignItems: 'flex-end',
  },
  qpAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
  },
  infoCard: {
    backgroundColor: '#161922',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#262D3D',
    borderStyle: 'dashed',
    marginTop: Spacing.md,
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
