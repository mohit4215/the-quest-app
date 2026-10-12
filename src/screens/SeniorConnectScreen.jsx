/**
 * SeniorConnectScreen — Placeholder screen for "Senior Connect"
 * Connecting hostellers with seniors for guidance, course materials, and hostel survival tips.
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

export default function SeniorConnectScreen() {
  const { accentColor } = useQuestMode();

  return (
    <View style={styles.container}>
      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🎓 Senior Connect Network</Text>
          <Text style={styles.introDesc}>
            Need End-Term PYQs, lab viva tips, or advice on gate passes? Connect with vetted senior hostellers from 3rd & 4th year.
          </Text>
        </View>

        {/* Featured Senior Profiles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Mentors in BH-2</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Abhinav Sharma</Text>
              <Text style={styles.profileRole}>4th Year • CSE • BH-2 Room 418</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>DBMS & OS Notes</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>⭐ 4.9 (42 chats)</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: accentColor }]}
            activeOpacity={0.8}
          >
            <Text style={styles.connectBtnText}>Ask for Notes / Advice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>VK</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Varun Kumar</Text>
              <Text style={styles.profileRole}>3rd Year • ECE • BH-2 Room 310</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Electronics Lab Viva</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>⭐ 4.8 (29 chats)</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: accentColor }]}
            activeOpacity={0.8}
          >
            <Text style={styles.connectBtnText}>Ask for Notes / Advice</Text>
          </TouchableOpacity>
        </View>

        {/* Architecture Note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>👥 Senior Connect Shell</Text>
          <Text style={styles.infoCardText}>
            This placeholder tab will power peer-to-peer hostel mentorship, shared study resources, and direct messaging between junior and senior residents.
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
  introCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#252B3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  avatarText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileRole: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  badgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  connectBtn: {
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
