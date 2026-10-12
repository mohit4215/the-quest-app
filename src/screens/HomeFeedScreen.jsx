/**
 * HomeFeedScreen — "Home Feed" tab for "Quest"
 * Features:
 * 1. "Live Campus Radar" card with pulsing indicator (active peers near campus spots)
 * 2. Horizontal category filter chips: All, Night Canteen, Gate Parcel, Printouts, Borrow Item
 * 3. List of realistic Quest Bounty Cards (Item, Pickup -> Drop-off, Countdown, Cash Tip + QP, Accept button in Quester Mode)
 * 4. Interactive "Post a Quest" bottom sheet modal triggered by Lazy Mode floating action button
 *    - Quick-fill templates ("Gate Zomato Pickup", "2x Maggi from Canteen", "Lab File Printout")
 *    - Interactive slider for Bounty Tip (₹10 to ₹100) auto-calculating bonus QP
 *    - Toggle for "Drop at Door" vs "4-Digit OTP Handover"
 *    - Dynamically prepends newly posted quest to top of list
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';
import LiveCampusRadar from '../components/quest/LiveCampusRadar';
import QuestBountyCard from '../components/quest/QuestBountyCard';
import PostQuestModal from '../components/quest/PostQuestModal';

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
    deliveryMethod: 'Drop at Door',
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
    qpReward: '+65 QP',
    notes: 'Show OTP 4821 to delivery executive Ramesh.',
    deliveryMethod: '4-Digit OTP Handover',
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
    deliveryMethod: 'Drop at Door',
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
    deliveryMethod: '4-Digit OTP Handover',
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
    deliveryMethod: '4-Digit OTP Handover',
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
    deliveryMethod: 'Drop at Door',
    isAccepted: false,
  },
];

export default function HomeFeedScreen() {
  const { isLazyMode, isQuesterMode, accentColor } = useQuestMode();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter logic
  const filteredQuests = useMemo(() => {
    if (selectedCategory === 'all') return quests;
    return quests.filter((q) => q.category === selectedCategory);
  }, [selectedCategory, quests]);

  const handleAcceptQuest = (id) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isAccepted: true } : q))
    );
    showToast('⚡ Quest accepted! Added to your Active Quest tracker.');
  };

  const handleAddNewQuest = (newQuest) => {
    // Dynamically prepend newly created quest to top of Home Feed list
    setQuests((prev) => [newQuest, ...prev]);

    // Ensure it's immediately visible
    if (selectedCategory !== 'all' && selectedCategory !== newQuest.category) {
      setSelectedCategory('all');
    }

    showToast(`🚀 "${newQuest.item}" posted live to BH-2 feed!`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar with Hostel Badge, Gold QP Badge, and Mode Switcher */}
      <TopAppBar />

      {/* Dynamic Toast Banner */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

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
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Post New Quest"
        >
          <Text style={styles.floatingPostIcon}>➕</Text>
          <Text style={styles.floatingPostText}>Post New Quest</Text>
        </TouchableOpacity>
      )}

      {/* Interactive "Post a Quest" Modal / Bottom Sheet */}
      <PostQuestModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddNewQuest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #0D0F14
  },
  toastContainer: {
    backgroundColor: '#1E2330',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3245',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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
});
