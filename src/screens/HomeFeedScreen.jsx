/**
 * HomeFeedScreen — Campus Radar & Production Scale Engine
 * 
 * Features:
 * - 🏃 Quester Mode: Radar Dashboard with urgent Gate parcel beacon & Slide-to-Claim
 * - 🛋️ Lazy Mode: Quick-Access Grid, Dynamic Bounty Slider with Instant Delivery
 * - ⏰ Scheduled / Pre-Order Quests: Future morning errands & xerox runs
 * - 🏪 Vendor Portal Modal: B2B2C Night Canteen & Xerox Shop order management
 * Theme: OLED Black (#000000)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';
import LiveCampusRadar from '../components/quest/LiveCampusRadar';
import QuestBountyCard from '../components/quest/QuestBountyCard';
import PostQuestModal from '../components/quest/PostQuestModal';

const CATEGORIES = [
  { id: 'all', label: 'All', iconName: 'sparkles' },
  { id: 'Gate Parcel', label: 'Gate Delivery', iconName: 'cube' },
  { id: 'Night Canteen', label: 'Night Canteen', iconName: 'restaurant' },
  { id: 'Printouts', label: 'Printouts', iconName: 'print' },
  { id: 'Scheduled', label: '⏰ Pre-Orders', iconName: 'time' },
  { id: 'Borrow Item', label: 'Borrow Item', iconName: 'swap-horizontal' },
];

const INITIAL_QUESTS = [
  {
    id: 'q_2',
    category: 'Gate Parcel',
    item: 'Swiggy Food Parcel (Biryani & Coke)',
    pickupSpot: 'Main Security Gate (Zomato/Swiggy Drop)',
    dropOffHostelRoom: 'BH-2 • Room 214',
    countdown: '8 mins left',
    cashTip: '₹40',
    qpReward: '+65 QP',
    notes: 'Show OTP 4821 to delivery executive Ramesh.',
    deliveryMethod: '4-Digit OTP Handover',
    isAccepted: false,
  },
  {
    id: 'q_sched_1',
    category: 'Scheduled',
    item: 'Operating Systems Lab File (Printed & Spiral Bound)',
    pickupSpot: 'Campus Xerox Shop (Counter 2)',
    dropOffHostelRoom: 'BH-1 • Room 302',
    countdown: 'Scheduled: Tomorrow 8:45 AM',
    cashTip: '₹35',
    qpReward: '+60 QP',
    notes: 'Pre-ordered for morning submission! Token #14.',
    deliveryMethod: 'Drop at Door',
    isAccepted: false,
    isScheduled: true,
  },
  {
    id: 'q_1',
    category: 'Night Canteen',
    item: '2× Cheese Butter Maggi & Cold Coffee',
    pickupSpot: 'Night Canteen (Nescafe Booth)',
    dropOffHostelRoom: 'BH-2 • Room 308',
    countdown: '15 mins left',
    cashTip: '₹30',
    qpReward: '+50 QP',
    notes: 'Please ask for extra seasoning packet if possible.',
    deliveryMethod: 'Drop at Door',
    isAccepted: false,
  },
  {
    id: 'q_3',
    category: 'Printouts',
    item: 'Compiler Design Lab Manual (14 pgs B&W)',
    pickupSpot: 'Stationery Shop (Xerox Counter)',
    dropOffHostelRoom: 'BH-2 • Room 104',
    countdown: '25 mins left',
    cashTip: '₹20',
    qpReward: '+35 QP',
    notes: 'Already paid via UPI, collect envelope with token #19.',
    deliveryMethod: 'Drop at Door',
    isAccepted: false,
  },
  {
    id: 'q_4',
    category: 'Night Canteen',
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
];

export default function HomeFeedScreen() {
  const navigation = useNavigation();
  const { isLazyMode, isQuesterMode, accentColor, acceptQuest } = useQuestMode();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Vendor Dashboard Modal state
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [vendorOrders, setVendorOrders] = useState([
    { id: 'v1', item: '2x Butter Maggi & Chai', token: '#22', status: 'preparing', student: 'Aman (BH-2 #214)' },
    { id: 'v2', item: 'Cold Coffee + Paneer Patties', token: '#23', status: 'ready', student: 'Rohan (BH-1 #108)' },
  ]);

  // Lazy Mode Dynamic Bounty Slider state
  const [lazyTip, setLazyTip] = useState(30);

  const filteredQuests = useMemo(() => {
    if (selectedCategory === 'all') return quests;
    if (selectedCategory === 'Scheduled') return quests.filter((q) => q.isScheduled || q.category === 'Scheduled');
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
    showToast('⚡ Quest Claimed! Opening Handshake Tracker...');

    setTimeout(() => {
      navigation.navigate('ActiveQuest');
    }, 350);
  };

  const handleAddNewQuest = (newQuest) => {
    setQuests((prev) => [newQuest, ...prev]);
    if (selectedCategory !== 'all' && selectedCategory !== newQuest.category) {
      setSelectedCategory('all');
    }
    showToast(`🚀 "${newQuest.item}" broadcasted live to campus feed!`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const getSpeedHelper = (tip) => {
    if (tip >= 50) return { label: 'Instant Claim Guarantee!', time: '⚡ ~3-5 mins', color: '#10B981', qp: '+80 QP' };
    if (tip >= 30) return { label: 'Fast Pickup Priority', time: '🏃 ~7-10 mins', color: '#F59E0B', qp: '+50 QP' };
    return { label: 'Standard Walk Speed', time: '🚶 ~15-20 mins', color: '#94A3B8', qp: '+25 QP' };
  };

  const speedInfo = getSpeedHelper(lazyTip);

  // Toggle Vendor Status
  const handleToggleVendorReady = (id) => {
    setVendorOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'ready' ? 'collected' : 'ready' } : o
      )
    );
    showToast('📢 Vendor marked order READY FOR PICKUP! Courier notified via Socket.');
  };

  return (
    <View style={styles.container}>
      <TopAppBar />

      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Campus Vendor Portal Quick Banner */}
      <View style={styles.vendorStrip}>
        <View style={styles.vendorStripLeft}>
          <Ionicons name="storefront" size={14} color="#F59E0B" />
          <Text style={styles.vendorStripText}>Campus Canteen & Xerox B2B2C Network</Text>
        </View>
        <TouchableOpacity
          style={styles.vendorStripBtn}
          onPress={() => setVendorModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.vendorStripBtnText}>Vendor Portal →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 🛋️ LAZY MODE HERO ── */}
        {isLazyMode && (
          <View style={styles.lazyHeroCard}>
            <View style={styles.lazyHeroTop}>
              <View>
                <Text style={styles.lazyHeroTitle}>What do you need right now?</Text>
                <Text style={styles.lazyHeroSubtitle}>
                  Order directly to your room door (BH-2 • #214)
                </Text>
              </View>
              <View style={styles.lazyBedIcon}>
                <Ionicons name="bed" size={20} color="#C4B5FD" />
              </View>
            </View>

            {/* 4 Large Quick-Access Tiles */}
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={styles.quickTile}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.tileEmoji}>🍔</Text>
                <Text style={styles.tileTitle}>Food Delivery</Text>
                <Text style={styles.tileSub}>Main Gate Pickup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickTile}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.tileEmoji}>🖨️</Text>
                <Text style={styles.tileTitle}>Urgent Printouts</Text>
                <Text style={styles.tileSub}>Xerox Shop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickTile}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.tileEmoji}>🍫</Text>
                <Text style={styles.tileTitle}>Midnight Snacks</Text>
                <Text style={styles.tileSub}>Night Canteen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickTile}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.tileEmoji}>⏰</Text>
                <Text style={styles.tileTitle}>Pre-Order / Later</Text>
                <Text style={styles.tileSub}>Morning Class Drop</Text>
              </TouchableOpacity>
            </View>

            {/* Dynamic Bounty Slider */}
            <View style={styles.sliderCard}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>DYNAMIC CASH TIP</Text>
                <Text style={styles.sliderValue}>₹{lazyTip}</Text>
              </View>

              <View style={styles.tipStepsRow}>
                {[15, 30, 45, 60].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.tipStepBtn,
                      lazyTip === val && styles.tipStepBtnActive,
                    ]}
                    onPress={() => setLazyTip(val)}
                  >
                    <Text style={[styles.tipStepText, lazyTip === val && styles.tipStepTextActive]}>
                      ₹{val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.speedIndicatorRow}>
                <Ionicons name="speedometer-outline" size={14} color={speedInfo.color} />
                <Text style={[styles.speedText, { color: speedInfo.color }]}>
                  {speedInfo.label} • {speedInfo.time}
                </Text>
                <View style={styles.speedQPBadge}>
                  <Text style={styles.speedQPText}>{speedInfo.qp}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.magicOrderBtn}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.magicOrderBtnText}>Post Errand Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── 🏃 QUESTER MODE HERO: Live Radar Dashboard ── */}
        {isQuesterMode && (
          <LiveCampusRadar
            onSelectSpot={(cat) => {
              if (cat) setSelectedCategory(cat);
            }}
          />
        )}

        {/* Category Filter Chips */}
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
                        backgroundColor: isLazyMode ? '#261F36' : '#1A3329',
                        borderColor: accentColor,
                      },
                    ],
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.iconName}
                    size={14}
                    color={isActive ? accentColor : '#94A3B8'}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      isActive && { color: accentColor, fontWeight: '800' },
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
                ? 'Campus Errand Radar'
                : selectedCategory === 'Scheduled'
                ? 'Pre-Orders & Morning Scheduled'
                : `${selectedCategory} Bounties`}
            </Text>
            <Text style={styles.feedSubtitle}>
              {isQuesterMode
                ? 'Slide to claim along your walking path (Up to 3 multi-batch)'
                : 'Active requests from hostel students'}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredQuests.length} available</Text>
          </View>
        </View>

        {/* Bounty Cards List with Slide to Claim */}
        {filteredQuests.map((quest) => (
          <QuestBountyCard
            key={quest.id}
            quest={quest}
            onAccept={handleAcceptQuest}
            onViewDetails={() => navigation.navigate('ActiveQuest')}
          />
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Post Quest Modal */}
      <PostQuestModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddNewQuest}
      />

      {/* ── 4. VENDOR DASHBOARD PORTAL MODAL ── */}
      <Modal
        visible={vendorModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setVendorModalVisible(false)}
      >
        <View style={styles.vendorModalOverlay}>
          <View style={styles.vendorModalCard}>
            <View style={styles.vendorModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="storefront" size={20} color="#F59E0B" />
                <View>
                  <Text style={styles.vendorTitle}>Night Canteen & Xerox Portal</Text>
                  <Text style={styles.vendorSub}>Order Queue & Ready-for-Pickup Dispatch</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setVendorModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.vendorQueueLabel}>INCOMING KITCHEN & PRINT QUEUE:</Text>
              {vendorOrders.map((order) => (
                <View key={order.id} style={styles.vendorOrderItem}>
                  <View style={styles.orderTop}>
                    <View style={styles.tokenBadge}>
                      <Text style={styles.tokenText}>{order.token}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderItemName}>{order.item}</Text>
                      <Text style={styles.orderStudent}>Student: {order.student}</Text>
                    </View>
                  </View>

                  <View style={styles.orderBottom}>
                    <View style={[
                      styles.orderStatusChip,
                      order.status === 'ready' ? styles.statusReady : styles.statusPrep
                    ]}>
                      <Text style={[
                        styles.orderStatusText,
                        order.status === 'ready' ? { color: '#10B981' } : { color: '#F59E0B' }
                      ]}>
                        {order.status === 'ready' ? 'READY FOR COURIER PICKUP' : 'PREPARING...'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.vendorActionBtn,
                        order.status === 'ready' ? styles.vendorActionCollected : styles.vendorActionReady
                      ]}
                      onPress={() => handleToggleVendorReady(order.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.vendorActionBtnText}>
                        {order.status === 'ready' ? 'Mark Collected' : 'Mark Ready ✓'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.vendorCloseBtn}
              onPress={() => setVendorModalVisible(false)}
            >
              <Text style={styles.vendorCloseBtnText}>Close Portal</Text>
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
    backgroundColor: '#000000', // OLED Black
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  toastContainer: {
    backgroundColor: '#1E1E28',
    marginHorizontal: Spacing.base,
    marginTop: 8,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },

  // Vendor Strip
  vendorStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16130B',
    paddingHorizontal: Spacing.base,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.25)',
  },
  vendorStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vendorStripText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
  },
  vendorStripBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  vendorStripBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCD34D',
  },

  // Lazy Mode Hero Card
  lazyHeroCard: {
    backgroundColor: '#1A1625',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    marginBottom: Spacing.base,
  },
  lazyHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  lazyHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  lazyHeroSubtitle: {
    fontSize: 11,
    color: '#C4B5FD',
    marginTop: 2,
  },
  lazyBedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickTile: {
    width: '48.5%',
    backgroundColor: '#261F36',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tileEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  tileSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },

  sliderCard: {
    backgroundColor: '#120F1C',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#C4B5FD',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A78BFA',
  },
  tipStepsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tipStepBtn: {
    flex: 1,
    backgroundColor: '#261F36',
    paddingVertical: 7,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tipStepBtnActive: {
    backgroundColor: Colors.lazyMode,
    borderColor: '#C4B5FD',
  },
  tipStepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tipStepTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  speedIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  speedQPBadge: {
    backgroundColor: '#1E170A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  speedQPText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FCD34D',
  },
  magicOrderBtn: {
    backgroundColor: Colors.lazyMode,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  magicOrderBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  filterSection: {
    marginBottom: 14,
  },
  filterScroll: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121217',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActive: {
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },

  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  feedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#181820',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Vendor Dashboard Modal
  vendorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  vendorModalCard: {
    backgroundColor: '#121217',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  vendorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  vendorTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  vendorSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  vendorQueueLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 10,
  },
  vendorOrderItem: {
    backgroundColor: '#181822',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  tokenBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tokenText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FCD34D',
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  orderStudent: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusPrep: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusReady: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  orderStatusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  vendorActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  vendorActionReady: {
    backgroundColor: '#10B981',
  },
  vendorActionCollected: {
    backgroundColor: '#334155',
  },
  vendorActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  vendorCloseBtn: {
    backgroundColor: '#262635',
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 14,
  },
  vendorCloseBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
});
