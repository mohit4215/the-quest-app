/**
 * SeniorConnectScreen — "Senior Connect" tab for "Quest"
 *
 * Requirements:
 * Students spend earned Quest Points (QP) to interact with 3rd/4th-year seniors
 * or borrow academic items.
 *
 * Two sub-tabs:
 * 1. "1-on-1 Mentorship":
 *    - Cards for verified seniors: Name, Year, Skill tags (Flutter, MLOps, DSA, Resume Review),
 *      rating, and "Book 15-min Chat (100 QP)" button.
 * 2. "Borrow Gear":
 *    - Cards for items: Lab Coats, Scientific Calculators, Drafters with "Request Item (30 QP)" button.
 *
 * Deducts QP from top navbar wallet upon booking/requesting and shows rich confirmation state.
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
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';

// Mock verified seniors data
const SENIORS_LIST = [
  {
    id: 'sen_1',
    name: 'Abhinav Sharma',
    year: '4th Year • CSE',
    room: 'BH-2 • Room 418',
    achievement: '✓ Amazon SDE Offer',
    rating: '⭐ 4.9 (54 chats)',
    skills: ['Flutter', 'DSA', 'Resume Review', 'System Design'],
    costQP: 100,
    availability: 'Available Tonight (9:30 PM)',
    bio: 'Placed at Amazon. Cracked 400+ LeetCode problems. Happy to review your resume or debug college projects.',
  },
  {
    id: 'sen_2',
    name: 'Sakshi Jain',
    year: '4th Year • IT',
    room: 'BH-1 • Room 302',
    achievement: '✓ Microsoft SWE Intern',
    rating: '⭐ 5.0 (68 chats)',
    skills: ['MLOps', 'Python', 'DSA', 'Mock Interviews'],
    costQP: 100,
    availability: 'Available Tomorrow (10 AM)',
    bio: 'Specialized in AI/ML & Python backends. Can help you structure your tech portfolio and prep for HR/Tech rounds.',
  },
  {
    id: 'sen_3',
    name: 'Rohit Tiwari',
    year: '3rd Year • ECE',
    room: 'BH-2 • Room 210',
    achievement: '✓ Google Summer of Code',
    rating: '⭐ 4.8 (37 chats)',
    skills: ['Flutter', 'Firebase', 'Mobile Architecture', 'Hackathons'],
    costQP: 100,
    availability: 'Online Now',
    bio: 'Won 3 national hackathons with cross-platform Flutter apps. Let’s talk mobile engineering and open source.',
  },
  {
    id: 'sen_4',
    name: 'Varun Aggarwal',
    year: '4th Year • CSE',
    room: 'BH-2 • Room 405',
    achievement: '✓ GATE AIR 124',
    rating: '⭐ 4.9 (42 chats)',
    skills: ['DSA', 'OS & DBMS', 'Core Subjects', 'Viva Prep'],
    costQP: 100,
    availability: 'Available Today 10 PM',
    bio: 'Top scorer in University end-terms. Will give you concise handwritten notes and prep tips for upcoming viva exams.',
  },
];

// Mock academic borrow gear data
const GEAR_LIST = [
  {
    id: 'gear_1',
    title: 'Standard White Lab Coat',
    category: 'Chemistry / Bio Lab Approved',
    emoji: '🥼',
    owner: 'Senior: Kunal M. (4th Year, BH-2 Room 314)',
    specs: 'Size L • 100% Pure Cotton • Freshly laundered & sanitised',
    costQP: 30,
    duration: '24h loan period',
    status: 'In Stock',
  },
  {
    id: 'gear_2',
    title: 'Casio fx-991EX ClassWiz Calculator',
    category: 'Approved for End-Term Exams',
    emoji: '🔢',
    owner: 'Senior: Aditya R. (3rd Year, BH-2 Room 104)',
    specs: 'Matrix, Vector & Equation Solver • Solar + Battery backup',
    costQP: 30,
    duration: 'Exam day loan',
    status: 'In Stock',
  },
  {
    id: 'gear_3',
    title: 'Engineering Mechanics Mini Drafter',
    category: 'Graphics & Drawing Lab',
    emoji: '📐',
    owner: 'Senior: Tushar G. (4th Year, BH-2 Room 405)',
    specs: 'Smooth steel arms • Heavy-duty table clamp • Sheet clips included',
    costQP: 30,
    duration: 'Full submission day',
    status: 'In Stock',
  },
  {
    id: 'gear_4',
    title: 'Arduino Uno Starter Kit + Breadboard',
    category: 'IoT & Embedded Systems',
    emoji: '⚡',
    owner: 'Senior: Harshit J. (3rd Year, BH-2 Room 220)',
    specs: 'Includes ultrasonic sensor, LEDs, resistors & jumper wires',
    costQP: 30,
    duration: 'Weekend hackathon loan',
    status: 'In Stock',
  },
];

export default function SeniorConnectScreen() {
  const { userProfile, deductQP } = useQuestMode();

  // Sub-tabs: 'mentorship' vs 'gear'
  const [activeSubTab, setActiveSubTab] = useState('mentorship');

  // Booked / requested state maps
  const [bookedSeniors, setBookedSeniors] = useState({});
  const [requestedGear, setRequestedGear] = useState({});

  // Feedback & Modal state
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [insufficientModal, setInsufficientModal] = useState(null);

  // 1. Book Senior Mentorship (100 QP)
  const handleBookSenior = (senior) => {
    if (bookedSeniors[senior.id]) return;

    const success = deductQP(senior.costQP);
    if (!success) {
      setInsufficientModal({
        cost: senior.costQP,
        current: userProfile?.qpBalance || 0,
        type: 'mentorship',
      });
      return;
    }

    setBookedSeniors((prev) => ({ ...prev, [senior.id]: true }));
    setConfirmationModal({
      type: 'mentorship',
      senior,
      deducted: senior.costQP,
      newBalance: (userProfile?.qpBalance || 0) - senior.costQP,
    });
  };

  // 2. Request Borrow Gear (30 QP)
  const handleRequestGear = (gear) => {
    if (requestedGear[gear.id]) return;

    const success = deductQP(gear.costQP);
    if (!success) {
      setInsufficientModal({
        cost: gear.costQP,
        current: userProfile?.qpBalance || 0,
        type: 'gear',
      });
      return;
    }

    setRequestedGear((prev) => ({ ...prev, [gear.id]: true }));
    setConfirmationModal({
      type: 'gear',
      gear,
      deducted: gear.costQP,
      newBalance: (userProfile?.qpBalance || 0) - gear.costQP,
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
        {/* Marketplace Overview Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroBadge}>🎓 PEER-TO-PEER EXCHANGE</Text>
            <View style={styles.qpBalancePill}>
              <Text style={styles.qpBalanceText}>
                Wallet: {userProfile?.qpBalance ?? 450} QP
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Senior Connect & Gear Hub</Text>
          <Text style={styles.heroDesc}>
            Spend your earned Quest Points on 1-on-1 senior mock interviews, placement prep, or borrow academic lab gear from hostellers.
          </Text>
        </View>

        {/* Sub-Tab Navigation Bar */}
        <View style={styles.subTabNav}>
          <TouchableOpacity
            style={[
              styles.subTabBtn,
              activeSubTab === 'mentorship' && styles.subTabBtnActive,
            ]}
            onPress={() => setActiveSubTab('mentorship')}
            activeOpacity={0.8}
          >
            <Text style={styles.subTabEmoji}>🎓</Text>
            <Text
              style={[
                styles.subTabText,
                activeSubTab === 'mentorship' && styles.subTabTextActive,
              ]}
            >
              1-on-1 Mentorship
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.subTabBtn,
              activeSubTab === 'gear' && styles.subTabBtnActive,
            ]}
            onPress={() => setActiveSubTab('gear')}
            activeOpacity={0.8}
          >
            <Text style={styles.subTabEmoji}>🛠️</Text>
            <Text
              style={[
                styles.subTabText,
                activeSubTab === 'gear' && styles.subTabTextActive,
              ]}
            >
              Borrow Gear
            </Text>
          </TouchableOpacity>
        </View>

        {/* SUB-TAB 1: 1-on-1 Mentorship */}
        {activeSubTab === 'mentorship' && (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Verified Senior Mentors</Text>
                <Text style={styles.sectionSubtitle}>
                  3rd & 4th year seniors ready for 15-min tactical advice
                </Text>
              </View>
              <View style={styles.ratePill}>
                <Text style={styles.ratePillText}>100 QP / session</Text>
              </View>
            </View>

            {SENIORS_LIST.map((senior) => {
              const isBooked = bookedSeniors[senior.id];

              return (
                <View key={senior.id} style={styles.seniorCard}>
                  {/* Senior Header */}
                  <View style={styles.seniorTopRow}>
                    <View style={styles.seniorAvatar}>
                      <Text style={styles.seniorAvatarText}>
                        {senior.name.split(' ').map((n) => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.seniorInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.seniorName}>{senior.name}</Text>
                        <Text style={styles.seniorRating}>{senior.rating}</Text>
                      </View>
                      <Text style={styles.seniorYear}>{senior.year} • {senior.room}</Text>
                      <View style={styles.achievementBadge}>
                        <Text style={styles.achievementText}>{senior.achievement}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Bio */}
                  <Text style={styles.seniorBio} numberOfLines={2}>
                    {senior.bio}
                  </Text>

                  {/* Skill Tags */}
                  <View style={styles.skillsRow}>
                    {senior.skills.map((skill, idx) => (
                      <View key={idx} style={styles.skillPill}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Bottom Footer: Availability & Book Button */}
                  <View style={styles.cardFooter}>
                    <View style={styles.availCol}>
                      <Text style={styles.availLabel}>AVAILABILITY</Text>
                      <Text style={styles.availVal}>{senior.availability}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.bookBtn,
                        isBooked && styles.bookedBtn,
                      ]}
                      onPress={() => handleBookSenior(senior)}
                      disabled={isBooked}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.bookBtnText, isBooked && styles.bookedBtnText]}>
                        {isBooked ? '✓ Booked! Chat Unlocked' : '⚡ Book 15-min Chat (100 QP)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SUB-TAB 2: Borrow Gear */}
        {activeSubTab === 'gear' && (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Hostel Academic Gear</Text>
                <Text style={styles.sectionSubtitle}>
                  Borrow verified lab supplies & calculators for 30 QP
                </Text>
              </View>
              <View style={styles.ratePill}>
                <Text style={styles.ratePillText}>30 QP / item</Text>
              </View>
            </View>

            {GEAR_LIST.map((gear) => {
              const isRequested = requestedGear[gear.id];

              return (
                <View key={gear.id} style={styles.gearCard}>
                  {/* Gear Header */}
                  <View style={styles.gearTopRow}>
                    <View style={styles.gearIconWrapper}>
                      <Text style={styles.gearEmoji}>{gear.emoji}</Text>
                    </View>
                    <View style={styles.gearInfo}>
                      <Text style={styles.gearTitle}>{gear.title}</Text>
                      <Text style={styles.gearCategory}>{gear.category}</Text>
                      <Text style={styles.gearOwner}>📍 {gear.owner}</Text>
                    </View>
                  </View>

                  {/* Specs */}
                  <View style={styles.specsBox}>
                    <Text style={styles.specsText}>📋 {gear.specs}</Text>
                    <Text style={styles.durationText}>⏳ {gear.duration}</Text>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Footer & Request Button */}
                  <View style={styles.cardFooter}>
                    <View style={styles.costBadge}>
                      <Text style={styles.costBadgeCoin}>🪙</Text>
                      <Text style={styles.costBadgeText}>30 QP</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.requestBtn,
                        isRequested && styles.requestedBtn,
                      ]}
                      onPress={() => handleRequestGear(gear)}
                      disabled={isRequested}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.requestBtnText,
                          isRequested && styles.requestedBtnText,
                        ]}
                      >
                        {isRequested ? '✓ Request Sent!' : '📦 Request Item (30 QP)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confirmation State Modal */}
      <Modal
        visible={!!confirmationModal}
        animationType="fade"
        transparent
        onRequestClose={() => setConfirmationModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmEmoji}>
              {confirmationModal?.type === 'mentorship' ? '🎉 🎓 🪙' : '📦 🤝 🪙'}
            </Text>

            <Text style={styles.confirmTitle}>
              {confirmationModal?.type === 'mentorship'
                ? 'Mentorship Chat Booked!'
                : 'Gear Request Confirmed!'}
            </Text>

            <Text style={styles.confirmSubtitle}>
              {confirmationModal?.type === 'mentorship'
                ? `15-minute slot locked with ${confirmationModal?.senior?.name}. Head to ${confirmationModal?.senior?.room} or connect via hostel network.`
                : `Your borrow request for "${confirmationModal?.gear?.title}" has been sent to ${confirmationModal?.gear?.owner}.`}
            </Text>

            {/* Receipt Summary */}
            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction:</Text>
                <Text style={styles.receiptValDeduct}>
                  -{confirmationModal?.deducted} QP Deducted
                </Text>
              </View>
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Updated Wallet Balance:</Text>
                <Text style={styles.receiptValTotal}>
                  {userProfile?.qpBalance ?? 450} QP
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmDoneBtn}
              onPress={() => setConfirmationModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmDoneBtnText}>Great, Got it!</Text>
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
          <View style={styles.confirmCard}>
            <Text style={styles.confirmEmoji}>🪙 ⚠️</Text>
            <Text style={styles.confirmTitle}>Insufficient Quest Points</Text>
            <Text style={styles.confirmSubtitle}>
              You need {insufficientModal?.cost} QP for this {insufficientModal?.type === 'mentorship' ? 'session' : 'item'}, but your current balance is {insufficientModal?.current} QP.
            </Text>

            <View style={styles.receiptBox}>
              <Text style={styles.earnHintText}>
                💡 Head to the Home Feed in Quester Mode to deliver snacks, parcels, or printouts to fellow hostellers and earn QP!
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmDoneBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => setInsufficientModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmDoneBtnText}>Earn More in Home Feed</Text>
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

  // Overview hero card
  heroCard: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#232838',
    marginBottom: Spacing.base,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#F59E0B',
  },
  qpBalancePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  qpBalanceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FBBF24',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Sub-Tab Navigation Bar
  subTabNav: {
    flexDirection: 'row',
    backgroundColor: '#0D0F14',
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232838',
    marginBottom: Spacing.lg,
    gap: 6,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  subTabBtnActive: {
    backgroundColor: '#1E2330',
    borderWidth: 1,
    borderColor: Colors.lazyMode, // Purple highlight
  },
  subTabEmoji: {
    fontSize: 14,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  subTabTextActive: {
    color: '#F9FAFB',
    fontWeight: '700',
  },

  // Section Header
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
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
  },
  ratePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DDD6FE',
  },

  // Senior Card
  seniorCard: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  seniorTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  seniorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.lazyMode,
  },
  seniorAvatarText: {
    color: '#DDD6FE',
    fontWeight: '800',
    fontSize: 14,
  },
  seniorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seniorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seniorRating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FBBF24',
  },
  seniorYear: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  achievementBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  achievementText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  seniorBio: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginVertical: 8,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  skillPill: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  skillText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#1E2330',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availCol: {
    flex: 1,
  },
  availLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  availVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A78BFA',
    marginTop: 1,
  },
  bookBtn: {
    backgroundColor: Colors.lazyMode, // #7C3AED
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  bookedBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bookedBtnText: {
    color: '#34D399',
  },

  // Gear Card
  gearCard: {
    backgroundColor: Colors.surface, // #161922
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  gearTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  gearIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#1E2330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  gearEmoji: {
    fontSize: 22,
  },
  gearInfo: {
    flex: 1,
  },
  gearTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gearCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 2,
  },
  gearOwner: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  specsBox: {
    backgroundColor: '#11141D',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1F2432',
    marginVertical: 8,
    gap: 3,
  },
  specsText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    gap: 4,
  },
  costBadgeCoin: {
    fontSize: 12,
  },
  costBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
  },
  requestBtn: {
    backgroundColor: '#3B82F6', // Blue action button for gear
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  requestedBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  requestedBtnText: {
    color: '#34D399',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#161922',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.lazyMode,
    alignItems: 'center',
  },
  confirmEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#0D0F14',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242C3D',
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  receiptLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  receiptValDeduct: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#1F2432',
    marginVertical: 6,
  },
  receiptValTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FBBF24',
  },
  earnHintText: {
    fontSize: 12,
    color: '#FCD34D',
    lineHeight: 17,
  },
  confirmDoneBtn: {
    width: '100%',
    backgroundColor: Colors.lazyMode,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  confirmDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
