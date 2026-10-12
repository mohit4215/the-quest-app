/**
 * HomeFeedScreen — "Home Feed" tab for "Quest"
 * White background theme
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
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';
import LiveCampusRadar from '../components/quest/LiveCampusRadar';
import QuestBountyCard from '../components/quest/QuestBountyCard';
import PostQuestModal from '../components/quest/PostQuestModal';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '⚡' },
  { id: 'Night Canteen', label: 'Night Canteen', icon: '🌙' },
  { id: 'Gate Parcel', label: 'Gate Parcel', icon: '🚪' },
  { id: 'Printouts', label: 'Printouts', icon: '🖨️' },
  { id: 'Borrow Item', label: 'Borrow Item', icon: '🤝' },
];

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
  const navigation = useNavigation();
  const { isLazyMode, isQuesterMode, accentColor, acceptQuest } = useQuestMode();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const filteredQuests = useMemo(() => {
    if (selectedCategory === 'all') return quests;
    return quests.filter((q) => q.category === selectedCategory);
  }, [selectedCategory, quests]);

  const handleAcceptQuest = (targetQuest) => {
    const questObj = typeof targetQuest === 'object'
      ? targetQuest
      : quests.find((q) => q.id === targetQuest) || INITIAL_QUESTS[0];

    setQuests((prev) =>
      prev.map((q) => (q.id === questObj.id ? { ...q, isAccepted: true } : q))
    );

    acceptQuest(questObj);
    showToast('⚡ Quest accepted! Opening Active Quest tracker...');

    setTimeout(() => {
      navigation.navigate('ActiveQuest');
    }, 350);
  };

  const handleAddNewQuest = (newQuest) => {
    setQuests((prev) => [newQuest, ...prev]);

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
      <TopAppBar />

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
        {/* 1. Live Campus Radar */}
        <LiveCampusRadar
          onSelectSpot={(cat) => {
            if (cat) setSelectedCategory(cat);
          }}
        />

        {/* 2. Category Filter Chips */}
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
                        backgroundColor: isLazyMode ? '#F5F3FF' : '#ECFDF5',
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

        {/* Feed Header */}
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

        {/* 3. Bounty Cards List */}
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

      {/* 4. Floating Action Button (Lazy Mode) */}
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
    backgroundColor: '#FFFFFF', // White background
  },
  toastContainer: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
  },
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
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#475569',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  feedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: Spacing.md,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
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
    elevation: 6,
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
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
