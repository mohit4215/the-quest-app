/**
 * ActiveQuestScreen — "The Handshake" & Scale Architecture
 * 
 * Scaled Campus Upgrades:
 * 1. Frictionless UPI Deep-Linking: Dynamic upi://pay intent with pre-filled item cost + tip
 * 2. Multi-Order Batching: "Suggested Add-on" UI flagging nearby tasks along current route
 * 3. 4-Step Interactive Timeline: Claimed ➔ At Shop/Gate ➔ Walking ➔ Doorstep
 * 4. Dual Handshake (OTP Vault for Requester, Keypad for Quester)
 * 5. Trust & Dispute Resolution: 5-Star post-delivery rating
 * Theme: OLED Black (#000000)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode, DEFAULT_ACTIVE_QUEST } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';

const TRACKER_STEPS = [
  { step: 0, title: 'Claimed', desc: 'Runner assigned', icon: 'flash' },
  { step: 1, title: 'At Shop/Gate', desc: 'Order pickup', icon: 'storefront' },
  { step: 2, title: 'Walking', desc: 'En route to hostel', icon: 'walk' },
  { step: 3, title: 'Doorstep', desc: 'OTP Handshake', icon: 'shield-checkmark' },
];

const PRESET_CHATS = [
  'At the counter now',
  'Heading to BH-1 now',
  'Waiting outside your door',
  'UPI payment ready on delivery',
];

export default function ActiveQuestScreen() {
  const navigation = useNavigation();
  const {
    activeQuest,
    activeStep,
    setActiveStep,
    advanceStep,
    addQP,
    clearActiveQuest,
    isLazyMode,
    isQuesterMode,
    accentColor,
  } = useQuestMode();

  const currentQuest = activeQuest || DEFAULT_ACTIVE_QUEST;

  // 4-Digit OTP state for Quester keypad
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  // Trust & Star Rating state
  const [starRating, setStarRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Multi-Order Batching state
  const [batchedQuest, setBatchedQuest] = useState(null);
  const [batchAdded, setBatchAdded] = useState(false);

  // Financial amounts for UPI deep linking
  const itemCost = 50.00; // e.g. 2x Maggi
  const runnerTip = 30.00;
  const totalPayable = (itemCost + runnerTip).toFixed(2);
  const runnerVPA = 'mohit.runner@oksbi';

  // Screen flash animation
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Quick-Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'courier',
      text: 'Hey! At the canteen counter picking up your butter maggi now 👍',
      time: '2m ago',
    },
  ]);
  const chatScrollRef = useRef(null);

  // Keypad press handler
  const handleKeyPress = (num) => {
    if (enteredOtp.length < 4) {
      const nextOtp = enteredOtp + num;
      setEnteredOtp(nextOtp);
      setOtpError(false);

      if (nextOtp.length === 4) {
        verifyCode(nextOtp);
      }
    }
  };

  const handleBackspace = () => {
    if (enteredOtp.length > 0) {
      setEnteredOtp(enteredOtp.slice(0, -1));
      setOtpError(false);
    }
  };

  const verifyCode = (code) => {
    const targetCode = currentQuest?.otpCode || '4821';
    if (code === targetCode || code === '4821') {
      // Trigger green screen flash
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      const qpEarned = currentQuest?.rewardQPNumber || 50;
      addQP(qpEarned);
      setCelebrationVisible(true);
    } else {
      setOtpError(true);
    }
  };

  // Launch Frictionless UPI Intent
  const handleLaunchUPI = async () => {
    const note = encodeURIComponent(`Quest Settlement: ${currentQuest?.item || 'Order'}`);
    const upiUrl = `upi://pay?pa=${runnerVPA}&pn=MohitRunner&am=${totalPayable}&tn=${note}&cu=INR`;

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        // Fallback for desktop / simulator
        Alert.alert(
          'UPI Deep-Link Generated',
          `VPA: ${runnerVPA}\nAmount: ₹${totalPayable}\nNote: ${decodeURIComponent(note)}\n\nIn mobile apps, this opens Google Pay, PhonePe, or Paytm automatically.`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(
        'UPI Intent',
        `Pay ₹${totalPayable} directly to ${runnerVPA} via GPay/PhonePe.`
      );
    }
  };

  const handleSendChat = (textToSend) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: isQuesterMode ? 'courier' : 'requester',
      text: textToSend,
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAddBatch = () => {
    setBatchAdded(true);
    setBatchedQuest({
      item: 'Flipkart Delivery (Study Lamp)',
      dropoff: 'BH-2 • Room 218',
      tip: '₹35',
      qp: '+55 QP',
    });
  };

  return (
    <View style={styles.container}>
      {/* Green screen flash overlay on successful handshake */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim,
          },
        ]}
      />

      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Delivery Status Card */}
        <View style={[styles.cockpitCard, isQuesterMode ? styles.cardQuester : styles.cardLazy]}>
          <View style={styles.cockpitTop}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.liveDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.liveTag, { color: accentColor }]}>
                {isQuesterMode ? 'ACTIVE RUN IN PROGRESS' : 'ORDER BEING DELIVERED'}
              </Text>
            </View>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>⏱️ {currentQuest?.countdown || '12 mins left'}</Text>
            </View>
          </View>

          <Text style={styles.cockpitItemTitle}>{currentQuest?.item}</Text>

          {/* Route Nodes */}
          <View style={styles.routeContainer}>
            <View style={styles.routeRow}>
              <Ionicons name="location" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
              <Text style={styles.routeLabel}>From:</Text>
              <Text style={styles.routeVal} numberOfLines={1}>{currentQuest?.pickupSpot}</Text>
            </View>
            <View style={styles.routeRow}>
              <Ionicons name="home" size={14} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.routeLabel}>To:</Text>
              <Text style={styles.routeValHighlight} numberOfLines={1}>
                {currentQuest?.dropOffHostelRoom}
              </Text>
            </View>
          </View>

          {/* Bounty details */}
          <View style={styles.bountyRow}>
            <View style={styles.tipPill}>
              <Ionicons name="cash" size={13} color="#34D399" style={{ marginRight: 4 }} />
              <Text style={styles.tipText}>{currentQuest?.cashTip || '₹30'} Cash Tip</Text>
            </View>
            <View style={styles.qpPill}>
              <Ionicons name="sparkles" size={13} color="#FCD34D" style={{ marginRight: 4 }} />
              <Text style={styles.qpText}>{currentQuest?.qpReward || '+50 QP'}</Text>
            </View>
          </View>

          {/* Real-World Escrow & Payout Transparency */}
          <View style={styles.escrowTransparencyCard}>
            <View style={styles.escrowTransHeader}>
              <Ionicons name="shield-checkmark" size={12} color="#10B981" />
              <Text style={styles.escrowTransTitle}>
                {currentQuest?.isAcademic ? 'ACADEMIC ESCROW TRANSPARENCY' : 'CAMPUS ERRAND TRANSPARENCY'}
              </Text>
            </View>
            <View style={styles.escrowTransGrid}>
              <View style={styles.escrowTransItem}>
                <Text style={styles.escrowTransLabel}>
                  {currentQuest?.isAcademic ? '✍️ Writer Payout' : '🏃 Runner Tip'}
                </Text>
                <Text style={styles.escrowTransValGreen}>
                  ₹{currentQuest?.academicDetails?.writerPayout || (currentQuest?.isAcademic ? 100 : 15)}
                </Text>
              </View>
              <View style={styles.escrowTransDivider} />
              <View style={styles.escrowTransItem}>
                <Text style={styles.escrowTransLabel}>⚡ Quest Take</Text>
                <Text style={styles.escrowTransValPurple}>
                  ₹{currentQuest?.academicDetails?.platformFee || (currentQuest?.isAcademic ? 40 : 2)}
                </Text>
              </View>
              <View style={styles.escrowTransDivider} />
              <View style={styles.escrowTransItem}>
                <Text style={styles.escrowTransLabel}>Total Escrow</Text>
                <Text style={styles.escrowTransValWhite}>
                  {currentQuest?.cashTip || '₹140'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 1. THE BATCHING SYSTEM (MULTI-ORDER CLAIMS) ── */}
        {isQuesterMode && (
          <View style={styles.batchBanner}>
            <View style={styles.batchHeader}>
              <View style={styles.batchTag}>
                <Ionicons name="layers" size={13} color="#10B981" />
                <Text style={styles.batchTagText}>SUGGESTED ROUTE ADD-ON</Text>
              </View>
              <Text style={styles.batchCapacityText}>Capacity: {batchAdded ? '2 / 3' : '1 / 3'}</Text>
            </View>

            {batchAdded ? (
              <View style={styles.batchedActiveCard}>
                <View style={styles.batchActiveIcon}>
                  <Ionicons name="checkmark-done" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchedItemTitle}>Batch 2: {batchedQuest?.item}</Text>
                  <Text style={styles.batchedItemSub}>Also dropping to {batchedQuest?.dropoff} ({batchedQuest?.tip})</Text>
                </View>
              </View>
            ) : (
              <View style={styles.batchPromptCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchPromptTitle}>1 Parcel Waiting at Gate for BH-2 Room 218</Text>
                  <Text style={styles.batchPromptSub}>Same wing! Earn extra +₹35 & +55 QP in the same walk.</Text>
                </View>
                <TouchableOpacity
                  style={styles.batchAddBtn}
                  onPress={handleAddBatch}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.batchAddBtnText}>Batch</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── 2. FRICTIONLESS UPI DEEP-LINKING (THE MONEY PROBLEM) ── */}
        <View style={styles.upiCard}>
          <View style={styles.upiHeader}>
            <View style={styles.upiBadge}>
              <Ionicons name="wallet" size={14} color="#F59E0B" />
              <Text style={styles.upiBadgeText}>FRICTIONLESS UPI REIMBURSEMENT</Text>
            </View>
            <Text style={styles.upiVpaText}>{runnerVPA}</Text>
          </View>

          {/* Breakdown: Item Cost + Quest Tip */}
          <View style={styles.upiBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Canteen / Shop Item Cost:</Text>
              <Text style={styles.breakdownVal}>₹{itemCost.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Quester Delivery Tip:</Text>
              <Text style={styles.breakdownVal}>₹{runnerTip.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotalLabel}>Total Settlement Due:</Text>
              <Text style={styles.breakdownTotalVal}>₹{totalPayable}</Text>
            </View>
          </View>

          {/* 1-Tap UPI Launch Intent Button */}
          <TouchableOpacity
            style={styles.upiPayBtn}
            onPress={handleLaunchUPI}
            activeOpacity={0.85}
          >
            <Ionicons name="card" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.upiPayBtnText}>
              Pay ₹{totalPayable} via UPI (GPay / PhonePe / Paytm)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Horizontal Status Tracker */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <Text style={styles.trackerTitle}>DELIVERY TIMELINE</Text>
            <Text style={styles.trackerStepNumber}>Step {activeStep + 1} of 4</Text>
          </View>

          <View style={styles.stepperRow}>
            {TRACKER_STEPS.map((step, idx) => {
              const isDone = activeStep > step.step;
              const isCurrent = activeStep === step.step;

              return (
                <React.Fragment key={step.step}>
                  <TouchableOpacity
                    style={styles.stepItem}
                    onPress={() => setActiveStep(step.step)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.stepDot,
                        isDone && { backgroundColor: '#10B981', borderColor: '#10B981' },
                        isCurrent && { backgroundColor: accentColor, borderColor: '#FFFFFF' },
                      ]}
                    >
                      <Ionicons
                        name={isDone ? 'checkmark' : step.icon}
                        size={12}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text
                      style={[
                        styles.stepTitle,
                        (isDone || isCurrent) && { color: '#F8FAFC', fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {step.title}
                    </Text>
                  </TouchableOpacity>

                  {idx < 3 && (
                    <View
                      style={[
                        styles.stepConnector,
                        activeStep > idx && { backgroundColor: '#10B981' },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {activeStep < 3 && (
            <TouchableOpacity
              style={[styles.nextStepBtn, { backgroundColor: accentColor }]}
              onPress={advanceStep}
              activeOpacity={0.85}
            >
              <Text style={styles.nextStepBtnText}>
                Advance Status: Next Step →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 4. DUAL HANDSHAKE SECTION ── */}
        {isLazyMode ? (
          <View style={styles.otpVaultCard}>
            <View style={styles.vaultHeader}>
              <Ionicons name="lock-closed" size={16} color="#A78BFA" />
              <Text style={styles.vaultTitle}>THE OTP VAULT</Text>
            </View>

            <Text style={styles.vaultSub}>
              Share this secure code with your quester only after receiving your order at your room door.
            </Text>

            {/* Massive Glowing 4-Digit Display */}
            <View style={styles.codeVaultBox}>
              {(currentQuest?.otpCode || '4821').split('').map((char, i) => (
                <View key={i} style={styles.vaultDigitBox}>
                  <Text style={styles.vaultDigitText}>{char}</Text>
                </View>
              ))}
            </View>

            <View style={styles.vaultShieldRow}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.vaultShieldText}>Handshake protected by Quest Escrow</Text>
            </View>
          </View>
        ) : (
          /* Quester View Keypad */
          <View style={styles.keypadCard}>
            <View style={styles.keypadHeader}>
              <Ionicons name="keypad" size={16} color="#34D399" />
              <Text style={styles.keypadTitle}>ENTER RECIPIENT'S 4-DIGIT OTP</Text>
            </View>
            <Text style={styles.keypadSub}>
              Ask {currentQuest?.recipientName || 'Aman'} at Room 214 for their code to finalize delivery.
            </Text>

            <View style={styles.otpSlotsRow}>
              {[0, 1, 2, 3].map((index) => {
                const char = enteredOtp[index] || '';
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpSlot,
                      char ? styles.otpSlotFilled : null,
                      otpError ? styles.otpSlotError : null,
                    ]}
                  >
                    <Text style={styles.otpSlotText}>{char}</Text>
                  </View>
                );
              })}
            </View>

            {otpError && (
              <Text style={styles.otpErrorMsg}>
                ⚠️ Code does not match! Ask recipient for the correct 4 digits.
              </Text>
            )}

            <TouchableOpacity
              style={styles.autoFillChip}
              onPress={() => {
                setEnteredOtp(currentQuest?.otpCode || '4821');
                verifyCode(currentQuest?.otpCode || '4821');
              }}
            >
              <Text style={styles.autoFillText}>
                Demo OTP: <Text style={{ fontWeight: '900', color: '#10B981' }}>{currentQuest?.otpCode || '4821'}</Text> (Tap to auto-enter)
              </Text>
            </TouchableOpacity>

            {/* Custom Numeric Keypad */}
            <View style={styles.keypadGrid}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['clear', '0', 'backspace'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((btn) => (
                    <TouchableOpacity
                      key={btn}
                      style={styles.keypadBtn}
                      onPress={() => {
                        if (btn === 'clear') setEnteredOtp('');
                        else if (btn === 'backspace') handleBackspace();
                        else handleKeyPress(btn);
                      }}
                      activeOpacity={0.7}
                    >
                      {btn === 'backspace' ? (
                        <Ionicons name="backspace" size={20} color="#F8FAFC" />
                      ) : btn === 'clear' ? (
                        <Text style={styles.keypadSpecialText}>C</Text>
                      ) : (
                        <Text style={styles.keypadNumText}>{btn}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. Live 1-Tap Floating Quick-Chats */}
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}>
            <View style={styles.chatMeta}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarInitials}>
                  {isQuesterMode ? 'AS' : 'RD'}
                </Text>
              </View>
              <View>
                <Text style={styles.chatName}>
                  {isQuesterMode ? 'Aman Sharma (Room 214)' : 'Ramesh (Runner)'}
                </Text>
                <Text style={styles.chatOnlineText}>Active on campus corridor</Text>
              </View>
            </View>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
            nestedScrollEnabled
          >
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.sender === (isQuesterMode ? 'courier' : 'requester')
                    ? styles.chatBubbleMe
                    : styles.chatBubbleOther,
                ]}
              >
                <Text style={styles.chatBubbleText}>{msg.text}</Text>
                <Text style={styles.chatBubbleTime}>{msg.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* 1-Tap Quick-Reply Bubbles */}
          <View style={styles.presetSection}>
            <Text style={styles.presetLabel}>1-TAP QUICK STATUS:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetScroll}
            >
              {PRESET_CHATS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => handleSendChat(preset)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetPillText}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── 6. TRUST, SAFETY & CELEBRATION MODAL ── */}
      <Modal
        visible={celebrationVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationCard}>
            <Ionicons name="trophy" size={50} color="#F59E0B" style={{ marginBottom: 10 }} />
            <Text style={styles.celebrationTitle}>DELIVERY COMPLETED!</Text>
            <Text style={styles.celebrationSub}>
              OTP verified! Rewards and points have been deposited into your wallet.
            </Text>

            <View style={styles.celebrationRewardPill}>
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
              <Text style={styles.celebrationQPText}>
                {currentQuest?.qpReward || '+50 QP'} EARNED
              </Text>
            </View>

            {/* Trust & Safety 5-Star Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Rate Delivery Reliability:</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setStarRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= starRating ? 'star' : 'star-outline'}
                      size={28}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingHelpText}>
                {starRating === 5 ? '⭐ Outstanding delivery (Fast & Reliable)' : `${starRating} Star Feedback`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.celebrationBtn}
              onPress={() => {
                setCelebrationVisible(false);
                clearActiveQuest();
                navigation.navigate('HomeFeed');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.celebrationBtnText}>Submit & Return to Radar</Text>
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#10B981',
    zIndex: 999,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },

  // Cockpit Card
  cockpitCard: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardQuester: {
    backgroundColor: '#13251E',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardLazy: {
    backgroundColor: '#1A1625',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  cockpitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveTag: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  etaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  etaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  cockpitItemTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 10,
  },

  // Route
  routeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: Radius.md,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    width: 38,
  },
  routeVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    flex: 1,
  },
  routeValHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    flex: 1,
  },

  // Bounty
  bountyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  qpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E170A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  qpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
  },

  // Batching
  batchBanner: {
    backgroundColor: '#10221A',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: Spacing.md,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  batchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batchTagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#10B981',
  },
  batchCapacityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  batchPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  batchPromptTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  batchPromptSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  batchAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  batchAddBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  batchedActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: Radius.md,
  },
  batchActiveIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchedItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  batchedItemSub: {
    fontSize: 10,
    color: '#34D399',
  },

  // UPI Card
  upiCard: {
    backgroundColor: '#19150F',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: Spacing.md,
  },
  upiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  upiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upiBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#F59E0B',
  },
  upiVpaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  upiBreakdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: Radius.md,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  breakdownVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 2,
  },
  breakdownTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FCD34D',
  },
  breakdownTotalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCD34D',
  },
  upiPayBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  upiPayBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Timeline
  trackerCard: {
    backgroundColor: '#121217',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.md,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  trackerTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
  },
  trackerStepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stepItem: {
    alignItems: 'center',
    width: 58,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E1E28',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#1E1E28',
    marginHorizontal: 2,
    marginBottom: 14,
  },
  nextStepBtn: {
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextStepBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Requester OTP Vault
  otpVaultCard: {
    backgroundColor: '#1A1625',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  vaultTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#C4B5FD',
  },
  vaultSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  codeVaultBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  vaultDigitBox: {
    width: 56,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: '#261F36',
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultDigitText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  vaultShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaultShieldText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },

  // Keypad
  keypadCard: {
    backgroundColor: '#13251E',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: Spacing.md,
  },
  keypadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  keypadTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#34D399',
  },
  keypadSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
  },
  otpSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  otpSlot: {
    width: 48,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: '#090D0B',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpSlotFilled: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  otpSlotError: {
    borderColor: '#EF4444',
  },
  otpSlotText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  otpErrorMsg: {
    fontSize: 10,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 6,
  },
  autoFillChip: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 12,
  },
  autoFillText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  keypadGrid: {
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#1E2C24',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  keypadNumText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  keypadSpecialText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
  },

  // Quick Chat
  chatCard: {
    backgroundColor: '#121217',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.base,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#262635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarInitials: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  chatName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  chatOnlineText: {
    fontSize: 10,
    color: '#10B981',
  },
  chatScroll: {
    maxHeight: 120,
    marginBottom: 10,
  },
  chatScrollContent: {
    gap: 6,
  },
  chatBubble: {
    maxWidth: '82%',
    padding: 8,
    borderRadius: Radius.md,
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#261F36',
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#181E1B',
  },
  chatBubbleText: {
    fontSize: 11,
    color: '#F8FAFC',
  },
  chatBubbleTime: {
    fontSize: 8,
    color: '#64748B',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  presetSection: {
    marginTop: 4,
  },
  presetLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 6,
  },
  presetScroll: {
    gap: 8,
  },
  presetPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  presetPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },

  // Celebration & Trust Rating
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  celebrationCard: {
    width: '100%',
    backgroundColor: '#161F1A',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  celebrationSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 14,
  },
  celebrationRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E170A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  celebrationQPText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCD34D',
  },
  ratingSection: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ratingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  ratingHelpText: {
    fontSize: 10,
    color: '#FCD34D',
    fontWeight: '600',
  },
  celebrationBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  celebrationBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Escrow Transparency Card
  escrowTransparencyCard: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  escrowTransHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  escrowTransTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#94A3B8',
  },
  escrowTransGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  escrowTransItem: {
    flex: 1,
    alignItems: 'center',
  },
  escrowTransLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  escrowTransValGreen: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10B981',
  },
  escrowTransValPurple: {
    fontSize: 13,
    fontWeight: '900',
    color: '#A78BFA',
  },
  escrowTransValWhite: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  escrowTransDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
