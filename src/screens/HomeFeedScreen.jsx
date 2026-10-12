/**
 * HomeFeedScreen — "Home Feed" tab for "Quest"
 * Features:
 * 1. "Live Campus Radar" card with pulsing indicator (active peers near campus spots)
 * 2. Horizontal category filter chips: All, Night Canteen, Gate Parcel, Printouts, Borrow Item
 * 3. List of realistic Quest Bounty Cards (Item, Pickup -> Drop-off, Countdown, Cash Tip + QP, Accept button in Quester Mode)
 * 4. "Post New Quest" floating action button (visible in Lazy Mode)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';
import LiveCampusRadar from '../components/quest/LiveCampusRadar';
import QuestBountyCard from '../components/quest/QuestBountyCard';

// Categories specified
const CATEGORIES = [
  { id: 'all', label: 'All', icon: '⚡' },
  { id: 'Night Canteen', label: 'Night Canteen', icon: '🌙' },
  { id: 'Gate Parcel', label: 'Gate Parcel', icon: '🚪' },
  { id: 'Printouts', label: 'Printouts', icon: '🖨️' },
  { id: 'Borrow Item', label: 'Borrow Item', icon: '🤝' },
];

// Realistic mock bounty quests
const INITIAL_QUESTS = [
  {
    id: 'q_1',
    category: 'Night Canteen',
    categoryIcon: '🌙',
    item: '2× Cheese Butter Maggi & Cold Coffee',
    pickupSpot: 'Night Canteen (Nescafe Booth)',
    dropOffHostelRoom: 'BH-2 • Room 214',
    countdown: '15 mins left',
    cashTip: '₹30',
    qpReward: '+50 QP',
    notes: 'Please ask for extra seasoning packet if possible.',
    isAccepted: false,
  },
  {
    id: 'q_2',
    category: 'Gate Parcel',
    categoryIcon: '🚪',
    item: 'Amazon Parcel (Myntra Shoe Box)',
    pickupSpot: 'Main Gate Security Post 1',
    dropOffHostelRoom: 'BH-2 • Room 308',
    countdown: '8 mins left',
    cashTip: '₹40',
    qpReward: '+60 QP',
    notes: 'Show OTP 4821 to delivery executive Ramesh.',
    isAccepted: false,
  },
  {
    id: 'q_3',
    category: 'Printouts',
    categoryIcon: '🖨️',
    item: 'Compiler Design Lab Manual (14 pgs B&W)',
    pickupSpot: 'Stationery Shop (Near Academic Block)',
    dropOffHostelRoom: 'BH-2 • Room 104',
    countdown: '25 mins left',
    cashTip: '₹20',
    qpReward: '+35 QP',
    notes: 'Already paid via UPI, just collect printout envelope #19.',
    isAccepted: false,
  },
  {
    id: 'q_4',
    category: 'Night Canteen',
    categoryIcon: '🌙',
    item: 'Spicy Paneer Roll + Thums Up (Can)',
    pickupSpot: 'Night Canteen (Roll Counter)',
    dropOffHostelRoom: 'BH-2 • Room 412',
    countdown: '10 mins left',
    cashTip: '₹25',
    qpReward: '+45 QP',
    notes: 'Deliver to 4th floor before hostel roll call.',
    isAccepted: false,
  },
  {
    id: 'q_5',
    category: 'Borrow Item',
    categoryIcon: '🤝',
    item: 'Electric Steam Iron for Placement Shirt',
    pickupSpot: 'BH-1 • Room 204',
    dropOffHostelRoom: 'BH-2 • Room 214',
    countdown: '35 mins left',
    cashTip: '₹30',
    qpReward: '+50 QP',
    notes: 'Will return safely within 45 mins. Urgent for interview tomorrow.',
    isAccepted: false,
  },
  {
    id: 'q_6',
    category: 'Gate Parcel',
    categoryIcon: '🚪',
    item: 'Blinkit Grocery Bag (Milk & Bread)',
    pickupSpot: 'Main Gate (Gate 2 Barrier)',
    dropOffHostelRoom: 'BH-2 • Room 118',
    countdown: '12 mins left',
    cashTip: '₹35',
    qpReward: '+55 QP',
    notes: 'Bag is sealed with green tape.',
    isAccepted: false,
  },
];

export default function HomeFeedScreen() {
  const { isLazyMode, isQuesterMode, accentColor } = useQuestMode();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quests, setQuests] = useState(INITIAL_QUESTS);

  // Modal for Lazy Mode "Post New Quest"
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newPickup, setNewPickup] = useState('Night Canteen');
  const [newCategory, setNewCategory] = useState('Night Canteen');
  const [newCashTip, setNewCashTip] = useState('30');

  // Filter logic
  const filteredQuests = useMemo(() => {
    if (selectedCategory === 'all') return quests;
    return quests.filter((q) => q.category === selectedCategory);
  }, [selectedCategory, quests]);

  const handleAcceptQuest = (id) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isAccepted: true } : q))
    );
  };

  const handlePostQuest = () => {
    if (!newItemTitle.trim()) {
      return;
    }

    const createdQuest = {
      id: `q_${Date.now()}`,
      category: newCategory,
      categoryIcon: newCategory === 'Night Canteen' ? '🌙' : newCategory === 'Gate Parcel' ? '🚪' : newCategory === 'Printouts' ? '🖨️' : '🤝',
      item: newItemTitle.trim(),
      pickupSpot: newPickup,
      dropOffHostelRoom: 'BH-2 • Room 214',
      countdown: '30 mins left',
      cashTip: `₹${newCashTip || '30'}`,
      qpReward: '+50 QP',
      notes: 'Posted by you from Room 214.',
      isAccepted: false,
    };

    setQuests([createdQuest, ...quests]);
    setNewItemTitle('');
    setPostModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar with Hostel Badge, Gold QP Badge, and Mode Switcher */}
      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Live Campus Radar Card */}
        <LiveCampusRadar
          onSelectSpot={(cat) => {
            if (cat) setSelectedCategory(cat);
          }}
        />

        {/* 2. Horizontal Category Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    isActive && [
                      styles.chipActive,
                      {
                        backgroundColor: isLazyMode
                          ? 'rgba(124, 58, 237, 0.22)'
                          : 'rgba(16, 185, 129, 0.22)',
                        borderColor: accentColor,
                      },
                    ],
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      isActive && { color: accentColor, fontWeight: '700' },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quest Section Header */}
        <View style={styles.feedHeader}>
          <View>
            <Text style={styles.feedTitle}>
              {selectedCategory === 'all'
                ? 'Active Quest Bounties'
                : `${selectedCategory} Bounties`}
            </Text>
            <Text style={styles.feedSubtitle}>
              {isQuesterMode
                ? 'Accept errands & earn Cash Tips + Quest Points'
                : 'Current requests from fellow BH-2 residents'}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredQuests.length} open</Text>
          </View>
        </View>

        {/* 3. List of realistic Quest Bounty Cards */}
        {filteredQuests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No active bounties in this category</Text>
            <Text style={styles.emptySubtitle}>
              Try switching filters or tap "All" to browse all hostel errands.
            </Text>
            <TouchableOpacity
              style={[styles.resetFilterBtn, { borderColor: accentColor }]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.resetFilterText, { color: accentColor }]}>
                View All Quests
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredQuests.map((quest) => (
            <QuestBountyCard
              key={quest.id}
              quest={quest}
              onAccept={handleAcceptQuest}
            />
          ))
        )}
      </ScrollView>

      {/* 4. "Post New Quest" Floating Action Button (Visible in Lazy Mode) */}
      {isLazyMode && (
        <TouchableOpacity
          style={[styles.floatingPostBtn, { backgroundColor: Colors.lazyMode }]}
          onPress={() => setPostModalVisible(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Post New Quest"
        >
          <Text style={styles.floatingPostIcon}>➕</Text>
          <Text style={styles.floatingPostText}>Post New Quest</Text>
        </TouchableOpacity>
      )}

      {/* Lazy Mode: Quick Post Quest Modal */}
      <Modal
        visible={postModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛋️ Post a Hostel Quest</Text>
              <TouchableOpacity
                onPress={() => setPostModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              A fellow resident heading that way will grab your order and deliver to Room 214!
            </Text>

            <Text style={styles.inputLabel}>What do you need?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2x Maggi & Sprite from Night Canteen"
              placeholderTextColor="#64748B"
              value={newItemTitle}
              onChangeText={setNewItemTitle}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.modalCategoryRow}>
              {['Night Canteen', 'Gate Parcel', 'Printouts', 'Borrow Item'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.modalCatChip,
                    newCategory === cat && styles.modalCatChipActive,
                  ]}
                  onPress={() => {
                    setNewCategory(cat);
                    if (cat === 'Night Canteen') setNewPickup('Night Canteen (Nescafe)');
                    if (cat === 'Gate Parcel') setNewPickup('Main Gate Security Desk');
                    if (cat === 'Printouts') setNewPickup('Stationery Shop');
                    if (cat === 'Borrow Item') setNewPickup('BH-1 or BH-2');
                  }}
                >
                  <Text
                    style={[
                      styles.modalCatText,
                      newCategory === cat && styles.modalCatTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Cash Tip (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={newCashTip}
              onChangeText={setNewCashTip}
            />

            <TouchableOpacity
              style={[styles.submitPostBtn, { backgroundColor: Colors.lazyMode }]}
              onPress={handlePostQuest}
              activeOpacity={0.8}
            >
              <Text style={styles.submitPostBtnText}>🚀 Launch Quest (+50 QP Reward)</Text>
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
    backgroundColor: Colors.background, // #0D0F14
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
  },

  // Category filter chips
  filterSection: {
    marginBottom: Spacing.base,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#232838',
    gap: 6,
  },
  chipActive: {
    borderWidth: 1.5,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Feed section header
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  feedSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Empty state
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  resetFilterBtn: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Floating Action Button in Lazy Mode
  floatingPostBtn: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: Radius.full,
    elevation: 8,
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingPostIcon: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  floatingPostText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#161922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#232838',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E2330',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0D0F14',
    borderWidth: 1,
    borderColor: '#2A3245',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    fontSize: 14,
    marginBottom: 14,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  modalCatChip: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  modalCatChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderColor: Colors.lazyMode,
  },
  modalCatText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalCatTextActive: {
    color: '#DDD6FE',
    fontWeight: '700',
  },
  submitPostBtn: {
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  submitPostBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
