/**
 * PostQuestModal — Interactive "Post a Quest" bottom sheet modal
 * Triggered by the floating action button in Lazy Mode.
 *
 * Features:
 * 1. Quick-fill template chips ("Gate Zomato Pickup", "2x Maggi from Canteen", "Lab File Printout")
 * 2. Input fields for Item Details, Pickup Location, and Drop-off Room
 * 3. Interactive slider for Bounty Tip (₹10 to ₹100) that automatically calculates bonus QP
 * 4. Toggle for "Drop at Door" vs "4-Digit OTP Handover"
 * 5. On submit: constructs quest object & prepends to Home Feed list
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';

// Quick-fill templates
const TEMPLATES = [
  {
    id: 'zomato',
    label: 'Gate Zomato Pickup',
    emoji: '🚪',
    item: 'Zomato Food Order (Hot & Fresh)',
    pickup: 'Main Gate Security Desk',
    category: 'Gate Parcel',
    categoryIcon: '🚪',
    defaultTip: 40,
    deliveryMethod: 'otp',
    notes: 'Call on arrival at hostel gate.',
  },
  {
    id: 'maggi',
    label: '2x Maggi from Canteen',
    emoji: '🍜',
    item: '2× Butter Maggi & Cold Coffee',
    pickup: 'Night Canteen (Nescafe Booth)',
    category: 'Night Canteen',
    categoryIcon: '🌙',
    defaultTip: 25,
    deliveryMethod: 'door',
    notes: 'Extra masala in Maggi please.',
  },
  {
    id: 'printout',
    label: 'Lab File Printout',
    emoji: '🖨️',
    item: 'Lab Manual & Assignment (10 Pages B&W)',
    pickup: 'Stationery Shop (Xerox Counter)',
    category: 'Printouts',
    categoryIcon: '🖨️',
    defaultTip: 20,
    deliveryMethod: 'door',
    notes: 'Paid via UPI, collect envelope with token #24.',
  },
];

// Helper to calculate bonus QP from tip
export function calculateBonusQP(tipAmount) {
  // Gamified formula: tip * 1.5 + 5 (e.g. ₹10 -> 20 QP, ₹30 -> 50 QP, ₹100 -> 155 QP)
  return Math.round(tipAmount * 1.5 + 5);
}

export default function PostQuestModal({
  visible,
  onClose,
  onSubmit,
}) {
  const { userProfile } = useQuestMode();

  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [pickupSpot, setPickupSpot] = useState('');
  const [dropOffRoom, setDropOffRoom] = useState(
    userProfile?.hostelBadge || 'BH-2 • Room 214'
  );
  const [category, setCategory] = useState('Night Canteen');
  const [categoryIcon, setCategoryIcon] = useState('🌙');
  const [notes, setNotes] = useState('');

  // 3. Bounty Tip (₹10 to ₹100)
  const [tip, setTip] = useState(30);

  // 4. Toggle: "Drop at Door" vs "4-Digit OTP Handover"
  // 'door' or 'otp'
  const [deliveryMethod, setDeliveryMethod] = useState('otp');

  // Slider interaction
  const sliderWidth = useRef(260).current;
  const trackRef = useRef(null);

  const bonusQP = calculateBonusQP(tip);

  // Template pre-fill handler
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    setItemTitle(template.item);
    setPickupSpot(template.pickup);
    setCategory(template.category);
    setCategoryIcon(template.categoryIcon);
    setTip(template.defaultTip);
    setDeliveryMethod(template.deliveryMethod);
    setNotes(template.notes);
  };

  // Slider tap / drag logic
  const handleSliderTouch = (evt) => {
    const { locationX } = evt.nativeEvent;
    const clampedX = Math.max(0, Math.min(sliderWidth, locationX));
    const percentage = clampedX / sliderWidth;
    // Range 10 to 100, step 5
    const rawVal = 10 + percentage * 90;
    const steppedVal = Math.round(rawVal / 5) * 5;
    setTip(Math.max(10, Math.min(100, steppedVal)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleSliderTouch(evt),
      onPanResponderMove: (evt) => handleSliderTouch(evt),
    })
  ).current;

  const handleSubmit = () => {
    if (!itemTitle.trim()) {
      return;
    }

    const newQuest = {
      id: `quest_${Date.now()}`,
      item: itemTitle.trim(),
      pickupSpot: pickupSpot.trim() || 'Campus Hub',
      dropOffHostelRoom: dropOffRoom.trim() || 'BH-2 • Room 214',
      category: category,
      categoryIcon: categoryIcon,
      countdown: '30 mins left',
      cashTip: `₹${tip}`,
      qpReward: `+${bonusQP} QP`,
      deliveryMethod: deliveryMethod === 'door' ? 'Drop at Door' : '4-Digit OTP Handover',
      otp: deliveryMethod === 'otp' ? Math.floor(1000 + Math.random() * 9000).toString() : null,
      notes: notes.trim()
        ? `${notes.trim()} • ${deliveryMethod === 'otp' ? '🔐 4-Digit OTP Handover' : '🚪 Drop at Door'}`
        : deliveryMethod === 'otp'
        ? '🔐 4-Digit OTP Handover required at room door.'
        : '🚪 Please drop outside door and knock.',
      isAccepted: false,
    };

    onSubmit(newQuest);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setItemTitle('');
    setPickupSpot('');
    setDropOffRoom(userProfile?.hostelBadge || 'BH-2 • Room 214');
    setTip(30);
    setDeliveryMethod('otp');
    setNotes('');
  };

  // Slider percentage for progress visual
  const sliderPercent = ((tip - 10) / 90) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Top Grab Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🛋️ Post a Quest</Text>
              <Text style={styles.subtitle}>
                A peer heading that way will fetch your delivery!
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Quick-Fill Template Chips */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>⚡ Quick-Fill Templates</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templatesScroll}
              >
                {TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <TouchableOpacity
                      key={tmpl.id}
                      style={[
                        styles.templateChip,
                        isSelected && styles.templateChipSelected,
                      ]}
                      onPress={() => handleSelectTemplate(tmpl)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.templateEmoji}>{tmpl.emoji}</Text>
                      <Text
                        style={[
                          styles.templateText,
                          isSelected && styles.templateTextSelected,
                        ]}
                      >
                        {tmpl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Input Fields: Item Details, Pickup Spot, Drop-Off Room */}
            <View style={styles.section}>
              <Text style={styles.inputTitle}>
                Item Details <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2x Maggi & Cold Coffee, Stationery, Zomato Bag"
                placeholderTextColor="#64748B"
                value={itemTitle}
                onChangeText={(text) => {
                  setItemTitle(text);
                  setSelectedTemplate(null);
                }}
              />

              <Text style={styles.inputTitle}>Pickup Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Night Canteen Nescafe, Main Gate, Xerox Shop"
                placeholderTextColor="#64748B"
                value={pickupSpot}
                onChangeText={setPickupSpot}
              />

              <Text style={styles.inputTitle}>Drop-off Hostel & Room</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. BH-2 • Room 214"
                placeholderTextColor="#64748B"
                value={dropOffRoom}
                onChangeText={setDropOffRoom}
              />

              <Text style={styles.inputTitle}>Special Instructions / Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder="e.g. Call when entering BH-2 2nd floor, extra ketchup"
                placeholderTextColor="#64748B"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* 3. Interactive Slider for Bounty Tip (₹10 to ₹100) */}
            <View style={styles.section}>
              <View style={styles.sliderHeaderRow}>
                <Text style={styles.sectionLabel}>💰 Bounty Cash Tip</Text>
                <View style={styles.tipBadge}>
                  <Text style={styles.tipBadgeText}>₹{tip}</Text>
                </View>
              </View>

              {/* Real-time bonus QP calculation preview */}
              <View style={styles.qpRewardBox}>
                <View style={styles.qpRewardLeft}>
                  <Text style={styles.qpCoinIcon}>🪙</Text>
                  <View>
                    <Text style={styles.qpBonusTitle}>+{bonusQP} Quest Points</Text>
                    <Text style={styles.qpBonusSubtitle}>
                      Auto-calculated incentive for your quester
                    </Text>
                  </View>
                </View>
                <View style={styles.qpPill}>
                  <Text style={styles.qpPillText}>+{bonusQP} QP</Text>
                </View>
              </View>

              {/* Slider Track */}
              <View style={styles.sliderContainer}>
                <View
                  style={styles.sliderTrackWrapper}
                  ref={trackRef}
                  {...panResponder.panHandlers}
                >
                  {/* Background Track */}
                  <View style={styles.sliderTrackBg}>
                    {/* Active Track */}
                    <View
                      style={[
                        styles.sliderTrackActive,
                        { width: `${sliderPercent}%` },
                      ]}
                    />
                  </View>

                  {/* Scrubber Thumb */}
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${sliderPercent}%` },
                    ]}
                  >
                    <View style={styles.thumbCenterDot} />
                  </View>
                </View>

                {/* Min / Max Labels */}
                <View style={styles.sliderLimitsRow}>
                  <Text style={styles.limitLabel}>₹10 (Min)</Text>
                  <Text style={styles.limitLabel}>₹50</Text>
                  <Text style={styles.limitLabel}>₹100 (Max)</Text>
                </View>

                {/* Quick Tip Pill Presets */}
                <View style={styles.quickPresetRow}>
                  {[10, 25, 30, 50, 75, 100].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.presetChip,
                        tip === val && styles.presetChipActive,
                      ]}
                      onPress={() => setTip(val)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          tip === val && styles.presetChipTextActive,
                        ]}
                      >
                        ₹{val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* 4. Toggle: "Drop at Door" vs "4-Digit OTP Handover" */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>📦 Delivery Handover Method</Text>

              <View style={styles.methodToggleTrack}>
                {/* Option A: Drop at Door */}
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    deliveryMethod === 'door' && styles.methodOptionActive,
                  ]}
                  onPress={() => setDeliveryMethod('door')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.methodEmoji}>🚪</Text>
                  <View style={styles.methodTextGroup}>
                    <Text
                      style={[
                        styles.methodTitle,
                        deliveryMethod === 'door' && styles.methodTitleActive,
                      ]}
                    >
                      Drop at Door
                    </Text>
                    <Text style={styles.methodDesc}>Contactless leave</Text>
                  </View>
                </TouchableOpacity>

                {/* Option B: 4-Digit OTP Handover */}
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    deliveryMethod === 'otp' && styles.methodOptionActiveOtp,
                  ]}
                  onPress={() => setDeliveryMethod('otp')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.methodEmoji}>🔐</Text>
                  <View style={styles.methodTextGroup}>
                    <Text
                      style={[
                        styles.methodTitle,
                        deliveryMethod === 'otp' && styles.methodTitleActiveOtp,
                      ]}
                    >
                      4-Digit OTP Handover
                    </Text>
                    <Text style={styles.methodDesc}>Secure handoff</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Delivery method helper info */}
              <View style={styles.methodInfoCard}>
                <Text style={styles.methodInfoText}>
                  {deliveryMethod === 'otp'
                    ? '🔒 Quester will request your 4-digit security code before completing delivery to prevent wrong room handoffs.'
                    : '🚪 Quester will drop your order right outside your room door and tap confirmation.'}
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !itemTitle.trim() && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!itemTitle.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnIcon}>🚀</Text>
              <Text style={styles.submitBtnText}>
                Launch Quest (Pay ₹{tip} + Give {bonusQP} QP)
              </Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.82)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161922',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#232838',
    paddingTop: 10,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2D3448',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2432',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBody: {
    padding: Spacing.base,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  // 1. Templates
  templatesScroll: {
    gap: 8,
    paddingRight: 6,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C212E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#262D3E',
    gap: 6,
  },
  templateChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderColor: Colors.lazyMode,
  },
  templateEmoji: {
    fontSize: 13,
  },
  templateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  templateTextSelected: {
    color: '#DDD6FE',
    fontWeight: '700',
  },

  // 2. Inputs
  inputTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#0D0F14',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#232838',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: 10,
  },
  notesInput: {
    height: 58,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  // 3. Tip Slider & QP Calculation
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  tipBadgeText: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '800',
  },
  qpRewardBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: 16,
  },
  qpRewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  qpCoinIcon: {
    fontSize: 18,
  },
  qpBonusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FBBF24',
  },
  qpBonusSubtitle: {
    fontSize: 11,
    color: '#FDE68A',
    opacity: 0.85,
  },
  qpPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  qpPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
  },

  // Interactive slider track
  sliderContainer: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  sliderTrackWrapper: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBg: {
    height: 8,
    backgroundColor: '#0D0F14',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#232838',
  },
  sliderTrackActive: {
    height: '100%',
    backgroundColor: Colors.lazyMode, // Purple slider track
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    marginLeft: -13,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lazyMode,
  },
  thumbCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lazyMode,
  },
  sliderLimitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  limitLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  quickPresetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  presetChip: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#2A3245',
  },
  presetChipActive: {
    backgroundColor: Colors.lazyMode,
    borderColor: Colors.lazyMode,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },

  // 4. Delivery Method Toggle
  methodToggleTrack: {
    flexDirection: 'row',
    backgroundColor: '#0D0F14',
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232838',
    gap: 6,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    gap: 8,
  },
  methodOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  methodOptionActiveOtp: {
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
    borderWidth: 1,
    borderColor: Colors.lazyMode,
  },
  methodEmoji: {
    fontSize: 18,
  },
  methodTextGroup: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  methodTitleActive: {
    color: '#93C5FD',
    fontWeight: '700',
  },
  methodTitleActiveOtp: {
    color: '#DDD6FE',
    fontWeight: '700',
  },
  methodDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  methodInfoCard: {
    backgroundColor: '#141822',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1F2432',
  },
  methodInfoText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Submit button
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lazyMode,
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: 8,
    marginTop: 8,
    elevation: 4,
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnIcon: {
    fontSize: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
