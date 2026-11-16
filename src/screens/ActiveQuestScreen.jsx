/**
 * ActiveQuestScreen — "The Handshake" Delivery Cockpit
 * Features:
 * 1. Horizontal Status Tracker: Open ➔ Claimed ➔ Walking ➔ Doorstep
 * 2. 1-Tap Floating Quick-Chats: "At counter", "Heading to BH-1 now", "Waiting outside"
 * 3. Dual-Role Handshake:
 *    - 🛋️ Requester View: Frosted-Glass OTP Vault displaying big 4-digit code
 *    - 🏃 Quester View: Custom Sleek Numeric Keypad + Green Screen Flash & QP Celebration
 * Theme: OLED Black (#000000)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
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
  'Send UPI QR on delivery',
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
        </View>

        {/* 1. Horizontal Status Tracker (Open ➔ Claimed ➔ Walking ➔ Doorstep) */}
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

          {/* Advance Step Button for Quester before reaching Doorstep */}
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

        {/* ── 2. DUAL HANDSHAKE SECTION ── */}
        {/* A. REQUESTER VIEW: The Frosted-Glass OTP Vault */}
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
          /* B. QUESTER VIEW: Sleek Numeric Handshake Keypad at Doorstep */
          <View style={styles.keypadCard}>
            <View style={styles.keypadHeader}>
              <Ionicons name="keypad" size={16} color="#34D399" />
              <Text style={styles.keypadTitle}>ENTER RECIPIENT'S 4-DIGIT OTP</Text>
            </View>
            <Text style={styles.keypadSub}>
              Ask {currentQuest?.recipientName || 'Aman'} at Room 214 for their code to finalize delivery.
            </Text>

            {/* OTP 4-Digit Slots */}
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

            {/* Demo auto-fill chip */}
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

        {/* 3. Live 1-Tap Floating Quick-Chats */}
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

      {/* Celebration Payout Modal */}
      <Modal
        visible={celebrationVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationCard}>
            <Ionicons name="trophy" size={54} color="#F59E0B" style={{ marginBottom: 10 }} />
            <Text style={styles.celebrationTitle}>DELIVERY COMPLETED!</Text>
            <Text style={styles.celebrationSub}>
              OTP verified! Rewards have been instantly deposited into your wallet.
            </Text>

            <View style={styles.celebrationRewardPill}>
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
              <Text style={styles.celebrationQPText}>
                {currentQuest?.qpReward || '+50 QP'} EARNED
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
              <Text style={styles.celebrationBtnText}>Back to Campus Radar</Text>
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

  // Horizontal Stepper
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
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  vaultDigitText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -1,
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

  // Quester Keypad Card
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

  // Live Quick Chat Card
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

  // Celebration Modal
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
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
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
    marginBottom: 16,
  },
  celebrationRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E170A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 20,
  },
  celebrationQPText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FCD34D',
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
});
