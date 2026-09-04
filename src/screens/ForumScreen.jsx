/**
 * ForumScreen — "Talk to a Senior" + Community Q&A
 *
 * Sections:
 *  1. AppHeader
 *  2. Tab switcher (Seniors | Threads | Ask)
 *  3. [Seniors tab] Scrollable senior profile cards with online status
 *  4. [Threads tab] Full Q&A thread list with upvote button
 *  5. [Ask tab] Compose new question form
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../constants';
import { AppHeader, Avatar, Card, PrimaryButton, SectionHeader } from '../components/common';
import { SENIORS, QA_THREADS } from '../data/mockData';

const TABS = [
  { id: 'seniors', label: '🎓 Seniors', count: SENIORS.filter((s) => s.online).length + ' online' },
  { id: 'threads', label: '💬 Threads', count: QA_THREADS.length },
  { id: 'ask', label: '✏️ Ask', count: null },
];

const TOPIC_TAGS = [
  'Placements', 'DSA', 'Academics', 'Internships',
  'GATE', 'Projects', 'Backlog', 'Campus Life',
];

export default function ForumScreen() {
  const [activeTab, setActiveTab] = useState('seniors');
  const [threads, setThreads] = useState(QA_THREADS);
  const [question, setQuestion] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState([]);

  function handleUpvote(threadId) {
    setUpvotedIds((prev) =>
      prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId]
    );
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, upvotes: upvotedIds.includes(t.id) ? t.upvotes - 1 : t.upvotes + 1 }
          : t
      )
    );
  }

  function handlePost() {
    if (!question.trim() || question.trim().length < 10) {
      Alert.alert('Too short', 'Your question needs at least 10 characters.');
      return;
    }
    if (!selectedTag) {
      Alert.alert('Pick a topic', 'Select a topic tag for your question.');
      return;
    }
    setPostLoading(true);
    setTimeout(() => {
      const newThread = {
        id: `t_${Date.now()}`,
        question: question.trim(),
        authorName: 'Rahul Verma',
        tag: selectedTag,
        timeAgo: 'Just now',
        replyCount: 0,
        upvotes: 0,
        answered: false,
      };
      setThreads((prev) => [newThread, ...prev]);
      setQuestion('');
      setSelectedTag(null);
      setPostLoading(false);
      setActiveTab('threads');
    }, 900);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Talk to a Senior"
        subtitle="AKGEC Community Forum"
        showQP={false}
        onNotifPress={() => {}}
      />

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.count !== null && (
              <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={[styles.tabIndicator, { left: `${TABS.findIndex((t) => t.id === activeTab) * 33.33}%` }]} />
      </View>

      {/* ── Seniors tab ──────────────────────────────────────── */}
      {activeTab === 'seniors' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <View style={styles.seniorBanner}>
            <Text style={styles.seniorBannerTitle}>
              Get real answers from students who've been through it.
            </Text>
            <Text style={styles.seniorBannerSub}>
              {SENIORS.filter((s) => s.online).length} seniors are online now
            </Text>
          </View>

          {/* Senior cards */}
          <View style={styles.seniorList}>
            {SENIORS.map((senior) => (
              <SeniorCard key={senior.id} senior={senior} />
            ))}
          </View>

          {/* Footer CTA */}
          <View style={styles.forumCTA}>
            <Text style={styles.forumCTAText}>
              Have a question but no specific senior in mind?
            </Text>
            <TouchableOpacity
              style={styles.postBtn}
              onPress={() => setActiveTab('ask')}
              activeOpacity={0.8}
            >
              <Text style={styles.postBtnText}>Post to the community  →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ── Threads tab ──────────────────────────────────────── */}
      {activeTab === 'threads' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.threadListHeader}>
            <Text style={styles.threadCount}>{threads.length} discussions</Text>
            <TouchableOpacity
              style={styles.askBtn}
              onPress={() => setActiveTab('ask')}
              activeOpacity={0.8}
            >
              <Text style={styles.askBtnText}>+ Ask</Text>
            </TouchableOpacity>
          </View>

          <Card padding="none" style={styles.threadCard}>
            {threads.map((thread, i) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                upvoted={upvotedIds.includes(thread.id)}
                onUpvote={() => handleUpvote(thread.id)}
                showBorder={i < threads.length - 1}
              />
            ))}
          </Card>
        </ScrollView>
      )}

      {/* ── Ask tab ───────────────────────────────────────────── */}
      {activeTab === 'ask' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.askContainer}>
              <Text style={styles.askHeading}>Ask the AKGEC community</Text>
              <Text style={styles.askSub}>
                Seniors and peers will answer — usually within an hour.
              </Text>

              {/* Question input */}
              <Text style={styles.fieldLabel}>Your question</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="e.g. How do I prepare for Amazon SDE interviews in 3 months?"
                placeholderTextColor={Colors.textMuted}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={300}
                accessibilityLabel="Question text"
              />
              <Text style={styles.charCount}>{question.length}/300</Text>

              {/* Topic tags */}
              <Text style={styles.fieldLabel}>Topic</Text>
              <View style={styles.tagsGrid}>
                {TOPIC_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, selectedTag === tag && styles.tagActive]}
                    onPress={() => setSelectedTag(tag)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selectedTag === tag }}
                  >
                    <Text style={[styles.tagText, selectedTag === tag && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tips */}
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>💡 Tips for a good question</Text>
                <Text style={styles.tipText}>• Be specific — mention your year, branch, or goal</Text>
                <Text style={styles.tipText}>• One focused question gets faster answers</Text>
                <Text style={styles.tipText}>• Earn 25 QP bonus if your question gets 10+ upvotes</Text>
              </View>

              {/* Submit */}
              <PrimaryButton
                label="Post Question"
                onPress={handlePost}
                loading={postLoading}
                disabled={question.trim().length < 10 || !selectedTag}
                variant="filled"
                size="lg"
                style={styles.postQBtn}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// ─── SeniorCard ───────────────────────────────────────────────────────────────
function SeniorCard({ senior }) {
  const [messageSent, setMessageSent] = useState(false);

  return (
    <Card style={seniorStyles.card} padding="md">
      <View style={seniorStyles.top}>
        <View style={seniorStyles.avatarWrap}>
          <Avatar name={senior.name} size="lg" />
          <View style={[seniorStyles.onlineDot, { backgroundColor: senior.online ? Colors.success : Colors.textMuted }]} />
        </View>

        <View style={seniorStyles.info}>
          <View style={seniorStyles.nameRow}>
            <Text style={seniorStyles.name}>{senior.name}</Text>
            {senior.online && (
              <View style={seniorStyles.onlinePill}>
                <Text style={seniorStyles.onlinePillText}>Online</Text>
              </View>
            )}
          </View>
          <Text style={seniorStyles.branch}>{senior.branch}</Text>
          <Text style={seniorStyles.company}>{senior.company}</Text>
        </View>
      </View>

      {/* Speciality tag */}
      <View style={seniorStyles.specialityRow}>
        <Text style={seniorStyles.specialityIcon}>✨</Text>
        <Text style={seniorStyles.speciality}>{senior.speciality}</Text>
      </View>

      {/* Stats row */}
      <View style={seniorStyles.statsRow}>
        <View style={seniorStyles.stat}>
          <Text style={seniorStyles.statIcon}>⭐</Text>
          <Text style={seniorStyles.statVal}>{senior.rating}</Text>
        </View>
        <View style={seniorStyles.stat}>
          <Text style={seniorStyles.statIcon}>👥</Text>
          <Text style={seniorStyles.statVal}>{senior.helpCount} helped</Text>
        </View>
        <View style={seniorStyles.stat}>
          <Text style={seniorStyles.statIcon}>⏱️</Text>
          <Text style={seniorStyles.statVal}>{senior.responseTime}</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[seniorStyles.msgBtn, messageSent && seniorStyles.msgBtnSent]}
        onPress={() => setMessageSent(true)}
        activeOpacity={0.8}
        disabled={messageSent}
      >
        <Text style={[seniorStyles.msgBtnText, messageSent && seniorStyles.msgBtnTextSent]}>
          {messageSent ? '✓ Request Sent' : `💬 Ask ${senior.name.split(' ')[0]}`}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const seniorStyles = StyleSheet.create({
  card: { marginHorizontal: Spacing.base, marginBottom: Spacing.md },
  top: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  info: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  name: { ...Typography.headingSm, color: Colors.textPrimary },
  onlinePill: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  onlinePillText: { fontSize: 9, fontWeight: '700', color: Colors.success },
  branch: { fontSize: 12, color: Colors.textSecondary, marginBottom: 1 },
  company: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  specialityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  specialityIcon: { fontSize: 12 },
  speciality: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 12 },
  statVal: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  msgBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    ...Shadow.sm,
  },
  msgBtnSent: { backgroundColor: Colors.successLight },
  msgBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },
  msgBtnTextSent: { color: Colors.success },
});

// ─── ThreadRow ────────────────────────────────────────────────────────────────
function ThreadRow({ thread, upvoted, onUpvote, showBorder }) {
  return (
    <View style={[threadStyles.row, showBorder && threadStyles.border]}>
      {/* Left: upvote */}
      <TouchableOpacity
        style={[threadStyles.upvoteBtn, upvoted && threadStyles.upvoteBtnActive]}
        onPress={onUpvote}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${upvoted ? 'Remove upvote' : 'Upvote'}: ${thread.upvotes} votes`}
      >
        <Text style={[threadStyles.upvoteIcon, upvoted && threadStyles.upvoteIconActive]}>▲</Text>
        <Text style={[threadStyles.upvoteCount, upvoted && threadStyles.upvoteCountActive]}>
          {thread.upvotes}
        </Text>
      </TouchableOpacity>

      {/* Body */}
      <View style={threadStyles.body}>
        <View style={threadStyles.metaRow}>
          <View style={[threadStyles.tagPill, { backgroundColor: Colors.accent }]}>
            <Text style={threadStyles.tagPillText}>{thread.tag}</Text>
          </View>
          {thread.answered && (
            <View style={[threadStyles.tagPill, { backgroundColor: Colors.successLight }]}>
              <Text style={[threadStyles.tagPillText, { color: Colors.success }]}>✓ Answered</Text>
            </View>
          )}
          <Text style={threadStyles.timeAgo}>{thread.timeAgo}</Text>
        </View>
        <Text style={threadStyles.question} numberOfLines={3}>{thread.question}</Text>
        <View style={threadStyles.footerRow}>
          <Avatar name={thread.authorName} size="sm" />
          <Text style={threadStyles.author}>{thread.authorName}</Text>
          <View style={threadStyles.replyStat}>
            <Text style={threadStyles.replyIcon}>💬</Text>
            <Text style={threadStyles.replyCount}>{thread.replyCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const threadStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  upvoteBtn: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 38,
  },
  upvoteBtnActive: { backgroundColor: Colors.primary },
  upvoteIcon: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
  upvoteIconActive: { color: Colors.textInverse },
  upvoteCount: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginTop: 2 },
  upvoteCountActive: { color: Colors.textInverse },
  body: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 5 },
  tagPill: { borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  tagPillText: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  timeAgo: { fontSize: 10, color: Colors.textMuted, marginLeft: 'auto' },
  question: { ...Typography.bodyLg, color: Colors.textPrimary, fontWeight: '500', lineHeight: 20, marginBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  author: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', flex: 1 },
  replyStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  replyIcon: { fontSize: 11 },
  replyCount: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Layout.tabBarHeight + Spacing.xl },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 5,
  },
  tabActive: {},
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary },
  tabBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: { backgroundColor: Colors.primary },
  tabBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },
  tabBadgeTextActive: { color: Colors.textInverse },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '33.33%',
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // Seniors
  seniorBanner: {
    backgroundColor: Colors.accent,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accentBorder,
  },
  seniorBannerTitle: { ...Typography.headingSm, color: Colors.primary, marginBottom: 3 },
  seniorBannerSub: { fontSize: 12, color: Colors.textSecondary },
  seniorList: { paddingTop: Spacing.base },
  forumCTA: {
    margin: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  forumCTAText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
  postBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  postBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Threads
  threadListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  threadCount: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  askBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  askBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: 13 },
  threadCard: { marginHorizontal: Spacing.base, overflow: 'hidden' },

  // Ask
  askContainer: { padding: Spacing.base },
  askHeading: { ...Typography.headingMd, color: Colors.textPrimary, marginBottom: 4 },
  askSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 19 },
  fieldLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
    ...Shadow.sm,
  },
  inputMulti: { minHeight: 110, textAlignVertical: 'top', paddingTop: Spacing.sm, marginBottom: 4 },
  charCount: { textAlign: 'right', fontSize: 11, color: Colors.textMuted, marginBottom: Spacing.lg },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  tag: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tagActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tagText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tagTextActive: { color: Colors.textInverse },
  tipBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: Colors.info, marginBottom: Spacing.sm },
  tipText: { fontSize: 12, color: Colors.info, lineHeight: 19 },
  postQBtn: { marginBottom: Spacing.base },
});
