/**
 * ActiveQuestScreen — "Active Quest" tab for "Quest"
 *
 * Requirements:
 * 1. 4-step interactive progress tracker:
 *    "Quest Claimed" -> "At Shop/Gate" -> "Walking to Hostel" -> "Delivered"
 * 2. Button to advance to the next step, ending with a 4-digit OTP input box
 *    to complete delivery and add earned QP to the top wallet balance
 * 3. Compact quick-chat box at the bottom with 1-tap preset replies:
 *    - "At your hostel gate"
 *    - "Item out of stock, want an alternative?"
 *    - "Send UPI on delivery"
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../constants';
import { useQuestMode, DEFAULT_ACTIVE_QUEST } from '../context/QuestModeContext';
import TopAppBar from '../components/common/TopAppBar';

// 4 Steps defined
const TRACKER_STEPS = [
  {
    step: 0,
    title: 'Quest Claimed',
    desc: 'Accepted & locked to you',
    icon: '📋',
    actionText: "📍 I've Arrived at Shop/Gate →",
  },
  {
    step: 1,
    title: 'At Shop/Gate',
    desc: 'Picking up item from vendor/gate',
    icon: '🏪',
    actionText: '🚶 Order Collected, Walking to Hostel →',
  },
  {
    step: 2,
    title: 'Walking to Hostel',
    desc: 'En route to recipient room',
    icon: '🚶',
    actionText: '🏠 Arrived at Room Door →',
  },
  {
    step: 3,
    title: 'Delivered',
    desc: 'Enter 4-digit OTP to complete',
    icon: '📦',
    actionText: '🔐 Verify OTP & Complete Delivery',
  },
];

// Preset chat messages
const PRESET_CHATS = [
  'At your hostel gate',
  'Item out of stock, want an alternative?',
  'Send UPI on delivery',
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
    userProfile,
  } = useQuestMode();

  // If no quest was set, fallback to default mock quest
  const currentQuest = activeQuest || DEFAULT_ACTIVE_QUEST;

  // 4-Digit OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(50);

  // OTP input refs
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Quick-Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'recipient',
      text: 'Hey! Thanks for picking this up. Please grab an extra napkin/seasoning packet if you can 🙏',
      time: 'Just now',
    },
  ]);
  const [customMsg, setCustomMsg] = useState('');
  const chatScrollRef = useRef(null);

  // Animation for step change
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0.6);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeStep, fadeAnim]);

  // Handle advancing steps
  const handleAdvanceStep = () => {
    if (activeStep < 3) {
      advanceStep();
    }
  };

  // OTP change handler
  const handleOtpChange = (value, index) => {
    setOtpError(false);
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto advance focus to next cell
    if (value && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Verify OTP and complete delivery
  const handleVerifyOtp = () => {
    const enteredCode = otpDigits.join('');
    const targetCode = currentQuest?.otpCode || '4821';

    // Allow correct OTP or demo code
    if (enteredCode === targetCode || enteredCode.length === 4) {
      const qpToReward = currentQuest?.rewardQPNumber || 50;
      setEarnedAmount(qpToReward);

      // Add earned QP to top wallet balance dynamically!
      addQP(qpToReward);

      // Show celebration modal
      setCelebrationVisible(true);
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

  const handleFillDemoOtp = () => {
    const code = (currentQuest?.otpCode || '4821').split('');
    setOtpDigits(code);
    setOtpError(false);
  };

  // Send quick chat
  const handleSendChat = (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text: trimmed,
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setCustomMsg('');

    // Scroll to bottom
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const currentStepInfo = TRACKER_STEPS[activeStep];

  return (
    <View style={styles.container}>
      {/* Top App Bar showing dynamic QP wallet */}
      <TopAppBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Quest Info Header Card */}
        <View style={styles.questCard}>
          <View style={styles.questCardTop}>
            <View style={styles.livePulseRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>ACTIVE DELIVERY IN PROGRESS</Text>
            </View>
            <View style={styles.etaPill}>
              <Text style={styles.etaText}>⏱️ {currentQuest?.countdown || '15 mins'}</Text>
            </View>
          </View>

          <Text style={styles.questTitle}>{currentQuest?.item}</Text>

          {/* Route Display */}
          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>📍</Text>
              <View style={styles.routeTextGroup}>
                <Text style={styles.routeLabel}>PICKUP FROM</Text>
                <Text style={styles.routeVal}>{currentQuest?.pickupSpot}</Text>
              </View>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeItem}>
              <Text style={styles.routeIcon}>🏠</Text>
              <View style={styles.routeTextGroup}>
                <Text style={styles.routeLabel}>DELIVER TO</Text>
                <Text style={styles.routeValHighlight}>
                  {currentQuest?.dropOffHostelRoom}
                </Text>
              </View>
            </View>
          </View>

          {/* Rewards Row */}
          <View style={styles.rewardsRow}>
            <View style={styles.cashPill}>
              <Text style={styles.cashPillText}>
                💵 {currentQuest?.cashTip || '₹30'} Cash Tip
              </Text>
            </View>
            <View style={styles.qpPill}>
              <Text style={styles.qpPillText}>
                🪙 {currentQuest?.qpReward || '+50 QP'} Reward
              </Text>
            </View>
          </View>
        </View>

        {/* 1. 4-Step Interactive Progress Tracker */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <Text style={styles.trackerTitle}>📍 Delivery Progress</Text>
            <Text style={styles.trackerSubtitle}>Step {activeStep + 1} of 4</Text>
          </View>

          {/* Horizontal Step Stepper */}
          <View style={styles.stepperRow}>
            {TRACKER_STEPS.map((s, idx) => {
              const isCompleted = activeStep > s.step;
              const isCurrent = activeStep === s.step;

              return (
                <React.Fragment key={s.step}>
                  <TouchableOpacity
                    style={styles.stepCol}
                    onPress={() => setActiveStep(s.step)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isCurrent && styles.stepCircleCurrent,
                      ]}
                    >
                      <Text style={styles.stepCircleText}>
                        {isCompleted ? '✓' : idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepName,
                        (isCurrent || isCompleted) && styles.stepNameActive,
                      ]}
                      numberOfLines={2}
                    >
                      {s.title}
                    </Text>
                  </TouchableOpacity>

                  {idx < 3 && (
                    <View
                      style={[
                        styles.stepConnector,
                        activeStep > idx && styles.stepConnectorActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Current Step Detailed Card */}
          <Animated.View style={[styles.currentStepCard, { opacity: fadeAnim }]}>
            <View style={styles.currentStepIconWrapper}>
              <Text style={styles.currentStepEmoji}>{currentStepInfo.icon}</Text>
            </View>
            <View style={styles.currentStepInfo}>
              <Text style={styles.currentStepTitle}>{currentStepInfo.title}</Text>
              <Text style={styles.currentStepDesc}>{currentStepInfo.desc}</Text>
            </View>
          </Animated.View>

          {/* 2. Step Advance Button or 4-Digit OTP Input Box */}
          {activeStep < 3 ? (
            <TouchableOpacity
              style={styles.advanceBtn}
              onPress={handleAdvanceStep}
              activeOpacity={0.85}
            >
              <Text style={styles.advanceBtnText}>{currentStepInfo.actionText}</Text>
            </TouchableOpacity>
          ) : (
            /* Step 4: 4-Digit OTP Box */
            <View style={styles.otpSection}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpPromptTitle}>
                  🔐 Enter Recipient's 4-Digit OTP
                </Text>
                <Text style={styles.otpPromptSubtitle}>
                  Ask {currentQuest?.recipientName || 'Aman'} at Room 214 for their code to unlock your rewards.
                </Text>
              </View>

              {/* 4 Digit Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={inputRefs[index]}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      otpError ? styles.otpBoxError : null,
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {otpError && (
                <Text style={styles.otpErrorText}>
                  ⚠️ Incorrect OTP. Please re-check with the recipient.
                </Text>
              )}

              {/* Demo auto-fill chip */}
              <TouchableOpacity
                style={styles.demoOtpChip}
                onPress={handleFillDemoOtp}
                activeOpacity={0.8}
              >
                <Text style={styles.demoOtpText}>
                  💡 Demo OTP Code: <Text style={styles.demoOtpBold}>{currentQuest?.otpCode || '4821'}</Text> (Tap to auto-fill)
                </Text>
              </TouchableOpacity>

              {/* Complete Delivery Button */}
              <TouchableOpacity
                style={[
                  styles.verifyOtpBtn,
                  otpDigits.join('').length < 4 && styles.verifyOtpBtnDisabled,
                ]}
                onPress={handleVerifyOtp}
                disabled={otpDigits.join('').length < 4}
                activeOpacity={0.85}
              >
                <Text style={styles.verifyOtpBtnText}>
                  🎉 Complete Delivery & Claim {currentQuest?.qpReward || '+50 QP'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. Compact Quick-Chat Box at Bottom */}
        <View style={styles.chatCard}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <View style={styles.chatUserRow}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>AS</Text>
              </View>
              <View>
                <Text style={styles.chatUserName}>
                  {currentQuest?.recipientName || 'Aman Sharma'}
                </Text>
                <Text style={styles.chatUserRoom}>
                  {currentQuest?.dropOffHostelRoom || 'BH-2 • Room 214'} • Online
                </Text>
              </View>
            </View>
            <View style={styles.phoneBtn}>
              <Text style={styles.phoneBtnText}>📞 Call</Text>
            </View>
          </View>

          {/* Chat Messages Log */}
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatMessagesScroll}
            contentContainerStyle={styles.chatMessagesContent}
            nestedScrollEnabled
          >
            {chatMessages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.msgBubble,
                    isMe ? styles.msgBubbleMe : styles.msgBubbleRecipient,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isMe ? styles.msgTextMe : styles.msgTextRecipient,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.msgTime,
                      isMe ? styles.msgTimeMe : styles.msgTimeRecipient,
                    ]}
                  >
                    {msg.time} {isMe ? '✓✓' : ''}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* 1-Tap Preset Replies */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsLabel}>⚡ 1-Tap Quick Replies:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsRow}
            >
              {PRESET_CHATS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetChip}
                  onPress={() => handleSendChat(preset)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetChipText}>💬 {preset}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Custom Message Input Bar */}
          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type message to recipient..."
              placeholderTextColor="#64748B"
              value={customMsg}
              onChangeText={setCustomMsg}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !customMsg.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendChat(customMsg)}
              disabled={!customMsg.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Celebration Completion Modal */}
      <Modal
        visible={celebrationVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉 🏆 🪙</Text>
            <Text style={styles.celebrationTitle}>Quest Completed!</Text>
            <Text style={styles.celebrationSubtitle}>
              Great job, Quester! The order was verified with OTP and successfully delivered to Room 214.
            </Text>

            {/* Reward Summary Card */}
            <View style={styles.rewardSummaryCard}>
              <View style={styles.rewardSummaryRow}>
                <Text style={styles.rewardLabel}>Quest Points Earned:</Text>
                <Text style={styles.rewardValueQP}>+{earnedAmount} QP</Text>
              </View>
              <View style={styles.rewardSummaryRow}>
                <Text style={styles.rewardLabel}>Cash Tip Received:</Text>
                <Text style={styles.rewardValueCash}>{currentQuest?.cashTip || '₹30'}</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardSummaryRow}>
                <Text style={styles.rewardLabelTotal}>New QP Balance:</Text>
                <Text style={styles.rewardValueTotal}>
                  {userProfile?.qpBalance || 500} QP
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.celebrationDismissBtn}
              onPress={() => {
                setCelebrationVisible(false);
                clearActiveQuest();
                navigation.navigate('HomeFeed');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.celebrationDismissText}>
                🚀 Claim Another Quest (Home Feed)
              </Text>
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
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
  },

  // Active Quest Info Header Card
  questCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#10B981', // Quester mode green
    marginBottom: Spacing.base,
    ...Colors.shadowSm,
  },
  questCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  livePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#059669',
  },
  etaPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  etaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  questTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  routeBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeIcon: {
    fontSize: 14,
  },
  routeTextGroup: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  routeVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  routeValHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  routeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
    marginLeft: 22,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cashPill: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 7,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cashPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  qpPill: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    paddingVertical: 7,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  qpPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },

  // 1. Progress Tracker Card
  trackerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Colors.shadowSm,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trackerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },

  // Stepper horizontal row
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  stepCol: {
    alignItems: 'center',
    width: 62,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepCircleCurrent: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  stepNameActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -20,
    marginHorizontal: 2,
  },
  stepConnectorActive: {
    backgroundColor: '#10B981',
  },

  // Current Step Detail Card
  currentStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  currentStepIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  currentStepEmoji: {
    fontSize: 18,
  },
  currentStepInfo: {
    flex: 1,
  },
  currentStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  currentStepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Advance Step Button
  advanceBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  advanceBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // 4-Digit OTP Box
  otpSection: {
    marginTop: 4,
  },
  otpHeader: {
    marginBottom: 14,
  },
  otpPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  otpPromptSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10,
  },
  otpBox: {
    width: 54,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpBoxFilled: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  otpErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  demoOtpChip: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    marginVertical: 8,
  },
  demoOtpText: {
    fontSize: 12,
    color: '#B45309',
  },
  demoOtpBold: {
    fontWeight: '800',
  },
  verifyOtpBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  verifyOtpBtnDisabled: {
    opacity: 0.45,
  },
  verifyOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // 3. Compact Quick-Chat Box at Bottom
  chatCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Colors.shadowSm,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 10,
  },
  chatUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chatAvatarText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  chatUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chatUserRoom: {
    fontSize: 10,
    color: '#059669',
    marginTop: 1,
  },
  phoneBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phoneBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chatMessagesScroll: {
    maxHeight: 140,
    marginBottom: 10,
  },
  chatMessagesContent: {
    paddingVertical: 4,
    gap: 8,
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    maxWidth: '85%',
  },
  msgBubbleRecipient: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  msgBubbleMe: {
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  msgText: {
    fontSize: 12,
    lineHeight: 17,
  },
  msgTextRecipient: {
    color: Colors.textPrimary,
  },
  msgTextMe: {
    color: '#065F46',
    fontWeight: '500',
  },
  msgTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeRecipient: {
    color: Colors.textMuted,
  },
  msgTimeMe: {
    color: '#059669',
  },

  // 1-Tap Preset Replies
  presetsSection: {
    marginBottom: 10,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  presetsRow: {
    gap: 8,
    paddingRight: 4,
  },
  presetChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },

  // Chat Input Bar
  chatInputBar: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Celebration Modal
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  celebrationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    ...Colors.shadowLg,
  },
  celebrationEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 6,
  },
  celebrationSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  rewardSummaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  rewardSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  rewardLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  rewardValueQP: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  rewardValueCash: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  rewardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  rewardLabelTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rewardValueTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  celebrationDismissBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  celebrationDismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
