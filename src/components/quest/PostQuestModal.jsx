/**
 * PostQuestModal — Interactive "Post a Quest" bottom sheet modal
 * White UI Theme
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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants';
import { useQuestMode } from '../../context/QuestModeContext';

// Quick-fill templates tailored for AKGEC Campus Realities
const TEMPLATES = [
  {
    id: 'lab_manual',
    label: 'Lab Manual Writing (10 pgs)',
    iconName: 'document-text-outline',
    item: '10-Page Lab Manual Writing (Handwritten)',
    pickup: 'Hostel Room (Provide Question PDF)',
    category: 'Academic Gigs',
    categoryIcon: 'document-text',
    defaultTip: 140, // ₹100 writer payout + ₹40 Quest fee
    deliveryMethod: 'otp',
    notes: 'Neat handwriting required in blue ball pen. Due tomorrow 8:30 AM.',
    isAcademic: true,
    writerPayout: 100,
    platformFee: 40,
  },
  {
    id: 'ed_sheet',
    label: 'Engineering Drawing (ED)',
    iconName: 'brush-outline',
    item: 'Engineering Drawing (ED) Sheet — Isometric',
    pickup: 'Hostel Room (Problem Sheet Given)',
    category: 'Academic Gigs',
    categoryIcon: 'brush',
    defaultTip: 220, // ₹160 drafter payout + ₹60 Quest fee
    deliveryMethod: 'otp',
    notes: 'A2 Chart Sheet with title block and borders. Finished physical sheet handover.',
    isAcademic: true,
    writerPayout: 160,
    platformFee: 60,
  },
  {
    id: 'zomato',
    label: 'Main Gate 1 Parcel Pickup',
    iconName: 'fast-food-outline',
    item: 'Main Gate Food Drop (Swiggy / Zomato)',
    pickup: 'Main Security Gate 1 (Drop Desk)',
    category: 'Gate Parcel',
    categoryIcon: 'cube',
    defaultTip: 15,
    deliveryMethod: 'otp',
    notes: 'Show OTP 4821 to delivery rider. Deliver to hostel door before curfew.',
    isAcademic: false,
    writerPayout: 15,
    platformFee: 2,
  },
  {
    id: 'printout',
    label: 'Lab File Print & Spiral',
    iconName: 'print-outline',
    item: 'Lab Manual Print & Spiral Binding',
    pickup: 'Campus Central Xerox Shop',
    category: 'Printouts',
    categoryIcon: 'print',
    defaultTip: 10,
    deliveryMethod: 'door',
    notes: 'Paid via UPI, collect envelope with token #24.',
    isAcademic: false,
    writerPayout: 10,
    platformFee: 1.5,
  },
];

export function calculateBonusQP(tipAmount) {
  return Math.round(tipAmount * 1.5 + 5);
}

export default function PostQuestModal({
  visible,
  onClose,
  onSubmit,
}) {
  const { userProfile } = useQuestMode();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [pickupSpot, setPickupSpot] = useState('');
  const [dropOffRoom, setDropOffRoom] = useState(
    userProfile?.hostelBadge || 'BH-2 • Room 214'
  );
  const [category, setCategory] = useState('Academic Gigs');
  const [categoryIcon, setCategoryIcon] = useState('📝');
  const [notes, setNotes] = useState('');
  const [tip, setTip] = useState(140);
  const [deliveryMethod, setDeliveryMethod] = useState('otp');
  const [isAcademic, setIsAcademic] = useState(true);
  const [writerPayout, setWriterPayout] = useState(100);
  const [platformFee, setPlatformFee] = useState(40);

  const sliderWidth = useRef(260).current;
  const trackRef = useRef(null);

  const bonusQP = calculateBonusQP(tip);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    setItemTitle(template.item);
    setPickupSpot(template.pickup);
    setCategory(template.category);
    setCategoryIcon(template.categoryIcon);
    setTip(template.defaultTip);
    setDeliveryMethod(template.deliveryMethod);
    setNotes(template.notes);
    setIsAcademic(template.isAcademic || false);
    setWriterPayout(template.writerPayout || template.defaultTip);
    setPlatformFee(template.platformFee || 2);
  };

  const handleSliderTouch = (evt) => {
    const { locationX } = evt.nativeEvent;
    const clampedX = Math.max(0, Math.min(sliderWidth, locationX));
    const percentage = clampedX / sliderWidth;
    const rawVal = 10 + percentage * 240;
    const steppedVal = Math.round(rawVal / 5) * 5;
    const newTip = Math.max(10, Math.min(250, steppedVal));
    setTip(newTip);
    if (isAcademic) {
      setWriterPayout(Math.round(newTip * 0.72));
      setPlatformFee(newTip - Math.round(newTip * 0.72));
    }
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
      countdown: isAcademic ? 'Due Tomorrow 8:30 AM' : '30 mins left',
      cashTip: `₹${tip}`,
      qpReward: `+${bonusQP} QP`,
      deliveryMethod: deliveryMethod === 'door' ? 'Drop at Door' : '4-Digit OTP Handover',
      otp: deliveryMethod === 'otp' ? Math.floor(1000 + Math.random() * 9000).toString() : null,
      isAcademic: isAcademic,
      academicDetails: isAcademic ? { writerPayout, platformFee } : null,
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
    setTip(140);
    setCategory('Academic Gigs');
    setIsAcademic(true);
    setWriterPayout(100);
    setPlatformFee(40);
    setDeliveryMethod('otp');
    setNotes('');
  };

  const sliderPercent = Math.min(100, Math.max(0, ((tip - 10) / 240) * 100));

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
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Post a Quest</Text>
              <Text style={styles.subtitle}>
                A peer heading that way will fetch your delivery!
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick-Fill Templates */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Quick-Fill Templates</Text>
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
                      <Ionicons
                        name={tmpl.iconName}
                        size={14}
                        color={isSelected ? Colors.lazyMode : Colors.textSecondary}
                        style={{ marginRight: 6 }}
                      />
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

            {/* AKGEC Campus Timings Banner */}
            <View style={styles.akgecNoticeCard}>
              <View style={styles.akgecNoticeHeader}>
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text style={styles.akgecNoticeTitle}>AKGEC Campus Lock-In Curfews</Text>
              </View>
              <Text style={styles.akgecNoticeText}>
                • Girls Hostel: Locked at <Text style={{fontWeight: '700', color: '#EF4444'}}>6:30 PM</Text> (Order early!){'\n'}
                • 1st Year Boys (BH-1): Locked at <Text style={{fontWeight: '700', color: '#F59E0B'}}>10:00 PM</Text>{'\n'}
                • Senior Boys (BH-2/BH-3): Locked at <Text style={{fontWeight: '700', color: '#10B981'}}>12:00 AM Midnight</Text>
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.section}>
              <Text style={styles.inputTitle}>
                Item / Gig Details <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Compiler Design Lab File (10 pgs), ED Sheet, Swiggy Gate Drop"
                placeholderTextColor="#94A3B8"
                value={itemTitle}
                onChangeText={(text) => {
                  setItemTitle(text);
                  setSelectedTemplate(null);
                }}
              />

              <Text style={styles.inputTitle}>Pickup Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Main Gate 1, Central Xerox Shop, BH-1 Floor 2"
                placeholderTextColor="#94A3B8"
                value={pickupSpot}
                onChangeText={setPickupSpot}
              />

              <Text style={styles.inputTitle}>Drop-off Hostel & Room</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. BH-2 • Room 214"
                placeholderTextColor="#94A3B8"
                value={dropOffRoom}
                onChangeText={setDropOffRoom}
              />

              <Text style={styles.inputTitle}>Special Instructions / Submission Deadline</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder="e.g. Due tomorrow 8:30 AM, neat handwriting in blue ball pen"
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Bounty Tip Slider */}
            <View style={styles.section}>
              <View style={styles.sliderHeaderRow}>
                <Text style={styles.sectionLabel}>
                  {isAcademic ? 'Academic Gig Bounty (Escrow)' : 'Bounty Cash Tip'}
                </Text>
                <View style={styles.tipBadge}>
                  <Text style={styles.tipBadgeText}>₹{tip}</Text>
                </View>
              </View>

              {/* Escrow Fee Transparency Breakdown */}
              <View style={styles.escrowCard}>
                <View style={styles.escrowHeader}>
                  <Ionicons name="shield-checkmark" size={15} color="#10B981" />
                  <Text style={styles.escrowTitle}>
                    {isAcademic ? 'Academic Escrow Breakdown' : 'Micro-Errand Escrow Breakdown'}
                  </Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>
                    {isAcademic ? '✍️ Peer Writer Payout:' : '🏃 Runner Tip:'}
                  </Text>
                  <Text style={styles.escrowValGreen}>₹{writerPayout}</Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>⚡ Quest Platform Fee:</Text>
                  <Text style={styles.escrowValPurple}>₹{platformFee}</Text>
                </View>
                <View style={[styles.escrowRow, styles.escrowTotalRow]}>
                  <Text style={styles.escrowTotalLabel}>Total Escrow Paid by You:</Text>
                  <Text style={styles.escrowTotalVal}>₹{tip}</Text>
                </View>
              </View>

              <View style={styles.qpRewardBox}>
                <View style={styles.qpRewardLeft}>
                  <Ionicons name="sparkles" size={16} color="#D97706" style={{ marginRight: 8 }} />
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
                  <View style={styles.sliderTrackBg}>
                    <View
                      style={[
                        styles.sliderTrackActive,
                        { width: `${sliderPercent}%` },
                      ]}
                    />
                  </View>

                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${sliderPercent}%` },
                    ]}
                  >
                    <View style={styles.thumbCenterDot} />
                  </View>
                </View>

                <View style={styles.sliderLimitsRow}>
                  <Text style={styles.limitLabel}>₹10 (Min)</Text>
                  <Text style={styles.limitLabel}>₹140 (Lab Gig)</Text>
                  <Text style={styles.limitLabel}>₹250 (Max)</Text>
                </View>
              </View>
            </View>

            {/* Handover Method Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Delivery Handover Method</Text>

              <View style={styles.methodToggleTrack}>
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    deliveryMethod === 'door' && styles.methodOptionActive,
                  ]}
                  onPress={() => setDeliveryMethod('door')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="home-outline"
                    size={16}
                    color={deliveryMethod === 'door' ? Colors.lazyMode : Colors.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <View>
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

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    deliveryMethod === 'otp' && styles.methodOptionActiveOtp,
                  ]}
                  onPress={() => setDeliveryMethod('otp')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={deliveryMethod === 'otp' ? Colors.lazyMode : Colors.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <View>
                    <Text
                      style={[
                        styles.methodTitle,
                        deliveryMethod === 'otp' && styles.methodTitleActiveOtp,
                      ]}
                    >
                      4-Digit OTP
                    </Text>
                    <Text style={styles.methodDesc}>Secure handoff</Text>
                  </View>
                </TouchableOpacity>
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
              <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF', // White
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
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
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#64748B',
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
    color: '#0F172A',
    marginBottom: 10,
  },

  // Templates
  templatesScroll: {
    gap: 8,
    paddingRight: 6,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  templateChipSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: Colors.lazyMode,
  },
  templateEmoji: {
    fontSize: 13,
  },
  templateText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  templateTextSelected: {
    color: Colors.lazyMode,
    fontWeight: '700',
  },

  // Inputs
  inputTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 4,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 10,
  },
  notesInput: {
    height: 58,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  // Tip Slider
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  tipBadgeText: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '800',
  },
  qpRewardBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
    color: '#B45309',
  },
  qpBonusSubtitle: {
    fontSize: 11,
    color: '#92400E',
  },
  qpPill: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  qpPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },

  // Slider track
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
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderTrackActive: {
    height: '100%',
    backgroundColor: Colors.lazyMode,
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
    elevation: 4,
    shadowColor: Colors.lazyMode,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    color: '#64748B',
    fontWeight: '600',
  },

  // Handover method
  methodToggleTrack: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    elevation: 2,
  },
  methodOptionActiveOtp: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.lazyMode,
    elevation: 2,
  },
  methodEmoji: {
    fontSize: 18,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  methodTitleActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  methodTitleActiveOtp: {
    color: Colors.lazyMode,
    fontWeight: '700',
  },
  methodDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
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
    elevation: 3,
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
  },

  // AKGEC Notice Card
  akgecNoticeCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Spacing.md,
  },
  akgecNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  akgecNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  akgecNoticeText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },

  // Escrow Breakdown Card
  escrowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  escrowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  escrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  escrowLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  escrowValGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  escrowValPurple: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  escrowTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 6,
    paddingTop: 6,
  },
  escrowTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  escrowTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});
