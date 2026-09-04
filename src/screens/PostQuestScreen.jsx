/**
 * PostQuestScreen — Requester Mode
 *
 * Form sections:
 *  1. AppHeader
 *  2. Item description input
 *  3. Vendor / pickup location dropdown (AKGEC hotspots)
 *  4. Drop-off location dropdown (hostels + buildings)
 *  5. Special instructions textarea
 *  6. Bounty setter — toggle Cash / QP, interactive slider
 *  7. Preview card — live summary before submission
 *  8. Submit button with success state
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Typography, Spacing, Radius, Shadow, Layout } from '../constants';
import { AppHeader, PrimaryButton, Card } from '../components/common';
import { CURRENT_USER } from '../data/mockData';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Dropdown data ────────────────────────────────────────────────────────────
const PICKUP_LOCATIONS = [
  { id: 'sachi_tea', label: 'Sachi Street — Tea Stall', icon: '☕' },
  { id: 'sachi_general', label: 'Sachi Street — General Store', icon: '🏪' },
  { id: 'sachi_samosa', label: 'Sachi Street — Samosa Corner', icon: '🥟' },
  { id: 'sachi_juice', label: 'Sachi Street — Juice Corner', icon: '🥤' },
  { id: 'xerox_gate2', label: 'Xerox Shop — Near Gate 2', icon: '🖨️' },
  { id: 'stationery_gate', label: 'Stationery Shop — Main Gate', icon: '📝' },
  { id: 'main_canteen', label: 'AKGEC Main Canteen', icon: '🍽️' },
];

const DROPOFF_LOCATIONS = [
  { id: 'h1', label: 'Hostel H-1', icon: '🏠' },
  { id: 'h2', label: 'Hostel H-2', icon: '🏠' },
  { id: 'h3', label: 'Hostel H-3', icon: '🏠' },
  { id: 'gh', label: 'Girls Hostel', icon: '🏠' },
  { id: 'cse_block', label: 'CSE Block', icon: '🖥️' },
  { id: 'it_block', label: 'IT Block', icon: '💻' },
  { id: 'ece_block', label: 'ECE Block', icon: '📡' },
  { id: 'library', label: 'Central Library', icon: '📚' },
  { id: 'seminar', label: 'Seminar Hall', icon: '🎤' },
];

// ─── Bounty slider range ──────────────────────────────────────────────────────
const BOUNTY_MIN = 10;
const BOUNTY_MAX = 200;
const SLIDER_WIDTH = 280; // px — must match style

function snapBounty(raw) {
  // Snap to nearest 5
  return Math.round(raw / 5) * 5;
}

export default function PostQuestScreen({ navigation }) {
  // Form state
  const [item, setItem] = useState('');
  const [pickupId, setPickupId] = useState(null);
  const [dropoffId, setDropoffId] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [bountyMode, setBountyMode] = useState('qp'); // 'qp' | 'cash'
  const [bounty, setBounty] = useState(40);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown open state
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);

  const pickup = PICKUP_LOCATIONS.find((l) => l.id === pickupId);
  const dropoff = DROPOFF_LOCATIONS.find((l) => l.id === dropoffId);

  // ── Slider pan responder ─────────────────────────────────────────────────
  const sliderAnim = useRef(
    new Animated.Value(((bounty - BOUNTY_MIN) / (BOUNTY_MAX - BOUNTY_MIN)) * SLIDER_WIDTH)
  ).current;
  const sliderX = useRef(((bounty - BOUNTY_MIN) / (BOUNTY_MAX - BOUNTY_MIN)) * SLIDER_WIDTH);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const newX = Math.max(0, Math.min(SLIDER_WIDTH, sliderX.current + gs.dx));
        sliderAnim.setValue(newX);
        const raw = BOUNTY_MIN + (newX / SLIDER_WIDTH) * (BOUNTY_MAX - BOUNTY_MIN);
        setBounty(snapBounty(raw));
      },
      onPanResponderRelease: (_, gs) => {
        const newX = Math.max(0, Math.min(SLIDER_WIDTH, sliderX.current + gs.dx));
        sliderX.current = newX;
        sliderAnim.setValue(newX);
      },
    })
  ).current;

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = item.trim().length > 3 && pickupId && dropoffId;

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!isValid) {
      Alert.alert('Missing details', 'Please fill in the item, pickup, and drop-off location.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  function handlePostAnother() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItem('');
    setPickupId(null);
    setDropoffId(null);
    setInstructions('');
    setBounty(40);
    setSubmitted(false);
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Post a Quest" subtitle="Requester Mode" showQP={false} />
        <SuccessScreen
          item={item}
          pickup={pickup}
          dropoff={dropoff}
          bounty={bounty}
          mode={bountyMode}
          onPostAnother={handlePostAnother}
          onGoHome={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Post a Quest"
        subtitle="Requester Mode"
        qpBalance={CURRENT_USER.qpBalance}
        showQP
        onNotifPress={() => {}}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── What do you need? ──────────────────────────────── */}
          <FormSection title="What do you need?" icon="📋" step={1}>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="e.g. 2× Maggi + Cold Coffee from Sachi"
              placeholderTextColor={Colors.textMuted}
              value={item}
              onChangeText={setItem}
              multiline
              maxLength={120}
              accessibilityLabel="Item description"
            />
            <Text style={styles.charCount}>{item.length}/120</Text>
          </FormSection>

          {/* ── Pickup location ────────────────────────────────── */}
          <FormSection title="Pickup from" icon="🏪" step={2}>
            <DropdownPicker
              placeholder="Select vendor / location"
              options={PICKUP_LOCATIONS}
              selectedId={pickupId}
              onSelect={(id) => { setPickupId(id); setPickupOpen(false); }}
              open={pickupOpen}
              onToggle={() => {
                setPickupOpen((p) => !p);
                setDropoffOpen(false);
              }}
            />
          </FormSection>

          {/* ── Drop-off location ──────────────────────────────── */}
          <FormSection title="Drop off at" icon="🏠" step={3}>
            <DropdownPicker
              placeholder="Select hostel / building"
              options={DROPOFF_LOCATIONS}
              selectedId={dropoffId}
              onSelect={(id) => { setDropoffId(id); setDropoffOpen(false); }}
              open={dropoffOpen}
              onToggle={() => {
                setDropoffOpen((p) => !p);
                setPickupOpen(false);
              }}
            />
            {dropoffId && (
              <TextInput
                style={[styles.input, styles.inputRoom]}
                placeholder="Room / seat number (optional)"
                placeholderTextColor={Colors.textMuted}
              />
            )}
          </FormSection>

          {/* ── Special instructions ───────────────────────────── */}
          <FormSection title="Special instructions" icon="✏️" step={4} optional>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="e.g. Extra mirchi in Maggi, cold coffee not blended..."
              placeholderTextColor={Colors.textMuted}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              maxLength={200}
              accessibilityLabel="Special instructions"
            />
          </FormSection>

          {/* ── Bounty setter ──────────────────────────────────── */}
          <FormSection title="Set your bounty" icon="🪙" step={5}>
            {/* Mode toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, bountyMode === 'qp' && styles.modeBtnActive]}
                onPress={() => setBountyMode('qp')}
                accessibilityRole="button"
                accessibilityState={{ selected: bountyMode === 'qp' }}
              >
                <Text style={[styles.modeBtnText, bountyMode === 'qp' && styles.modeBtnTextActive]}>
                  🪙 Quest Points
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, bountyMode === 'cash' && styles.modeBtnActive]}
                onPress={() => setBountyMode('cash')}
                accessibilityRole="button"
                accessibilityState={{ selected: bountyMode === 'cash' }}
              >
                <Text style={[styles.modeBtnText, bountyMode === 'cash' && styles.modeBtnTextActive]}>
                  ₹ Cash Tip
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bounty display */}
            <View style={styles.bountyDisplay}>
              <Text style={styles.bountyValue}>
                {bountyMode === 'qp' ? `${bounty} QP` : `₹${bounty}`}
              </Text>
              <Text style={styles.bountyHint}>
                {bountyMode === 'qp'
                  ? `≈ ₹${Math.round(bounty * 0.5)} equivalent`
                  : `≈ ${Math.round(bounty * 2)} QP equivalent`}
              </Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderMin}>{bountyMode === 'qp' ? '10 QP' : '₹10'}</Text>
              <View style={styles.sliderTrack}>
                <Animated.View
                  style={[
                    styles.sliderFill,
                    { width: sliderAnim },
                  ]}
                />
                <Animated.View
                  style={[styles.sliderThumb, { transform: [{ translateX: sliderAnim }] }]}
                  {...panResponder.panHandlers}
                  accessibilityRole="adjustable"
                  accessibilityLabel={`Bounty: ${bounty}`}
                />
              </View>
              <Text style={styles.sliderMax}>{bountyMode === 'qp' ? '200 QP' : '₹200'}</Text>
            </View>

            {/* Quick-select chips */}
            <View style={styles.quickBounty}>
              {[20, 40, 60, 100].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickChip, bounty === val && styles.quickChipActive]}
                  onPress={() => {
                    setBounty(val);
                    const x = ((val - BOUNTY_MIN) / (BOUNTY_MAX - BOUNTY_MIN)) * SLIDER_WIDTH;
                    sliderX.current = x;
                    sliderAnim.setValue(x);
                  }}
                >
                  <Text style={[styles.quickChipText, bounty === val && styles.quickChipTextActive]}>
                    {bountyMode === 'qp' ? `${val} QP` : `₹${val}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormSection>

          {/* ── Live preview card ──────────────────────────────── */}
          {isValid && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Preview</Text>
              <PreviewCard
                item={item}
                pickup={pickup}
                dropoff={dropoff}
                instructions={instructions}
                bounty={bounty}
                mode={bountyMode}
              />
            </View>
          )}

          {/* ── Submit ────────────────────────────────────────── */}
          <View style={styles.submitSection}>
            <PrimaryButton
              label="Post Quest 🚀"
              onPress={handleSubmit}
              loading={loading}
              disabled={!isValid}
              variant="filled"
              size="lg"
            />
            {!isValid && (
              <Text style={styles.validationHint}>
                Fill in item, pickup, and drop-off to continue
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── FormSection ──────────────────────────────────────────────────────────────
function FormSection({ title, icon, step, optional, children }) {
  return (
    <View style={formStyles.section}>
      <View style={formStyles.sectionHeader}>
        <View style={formStyles.stepBadge}>
          <Text style={formStyles.stepText}>{step}</Text>
        </View>
        <Text style={formStyles.icon}>{icon}</Text>
        <Text style={formStyles.title}>{title}</Text>
        {optional && <Text style={formStyles.optional}>(optional)</Text>}
      </View>
      <View style={formStyles.body}>{children}</View>
    </View>
  );
}

const formStyles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
  icon: { fontSize: 16 },
  title: {
    ...Typography.headingSm,
    color: Colors.textPrimary,
    flex: 1,
  },
  optional: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  body: {},
});

// ─── DropdownPicker ───────────────────────────────────────────────────────────
function DropdownPicker({ placeholder, options, selectedId, onSelect, open, onToggle }) {
  const selected = options.find((o) => o.id === selectedId);

  return (
    <View style={dropStyles.wrapper}>
      <TouchableOpacity
        style={[dropStyles.trigger, open && dropStyles.triggerOpen]}
        onPress={onToggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={selected ? selected.label : placeholder}
      >
        {selected ? (
          <View style={dropStyles.selectedRow}>
            <Text style={dropStyles.selectedIcon}>{selected.icon}</Text>
            <Text style={dropStyles.selectedLabel}>{selected.label}</Text>
          </View>
        ) : (
          <Text style={dropStyles.placeholder}>{placeholder}</Text>
        )}
        <Text style={[dropStyles.chevron, open && dropStyles.chevronOpen]}>›</Text>
      </TouchableOpacity>

      {open && (
        <View style={dropStyles.menu}>
          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={false}
          >
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  dropStyles.option,
                  opt.id === selectedId && dropStyles.optionSelected,
                  i < options.length - 1 && dropStyles.optionBorder,
                ]}
                onPress={() => onSelect(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={dropStyles.optionIcon}>{opt.icon}</Text>
                <Text style={[dropStyles.optionLabel, opt.id === selectedId && dropStyles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                {opt.id === selectedId && <Text style={dropStyles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const dropStyles = StyleSheet.create({
  wrapper: { position: 'relative', zIndex: 10 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: Layout.inputHeight,
    ...Shadow.sm,
  },
  triggerOpen: {
    borderColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedIcon: { fontSize: 16 },
  selectedLabel: { ...Typography.bodyLg, color: Colors.textPrimary, fontWeight: '500' },
  placeholder: { ...Typography.bodyLg, color: Colors.textMuted },
  chevron: { fontSize: 20, color: Colors.textMuted, transform: [{ rotate: '90deg' }] },
  chevronOpen: { transform: [{ rotate: '-90deg' }] },
  menu: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    ...Shadow.md,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  optionSelected: { backgroundColor: Colors.accent },
  optionIcon: { fontSize: 15 },
  optionLabel: { ...Typography.bodyMd, color: Colors.textSecondary, flex: 1 },
  optionLabelSelected: { color: Colors.primary, fontWeight: '600' },
  checkmark: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});

// ─── PreviewCard ──────────────────────────────────────────────────────────────
function PreviewCard({ item, pickup, dropoff, instructions, bounty, mode }) {
  return (
    <Card style={previewStyles.card} padding="md">
      <View style={previewStyles.headerRow}>
        <Text style={previewStyles.title} numberOfLines={2}>{item}</Text>
        <View style={previewStyles.bountyPill}>
          <Text style={previewStyles.bountyText}>
            {mode === 'qp' ? `${bounty} QP` : `₹${bounty}`}
          </Text>
        </View>
      </View>
      {pickup && (
        <View style={previewStyles.row}>
          <Text style={previewStyles.rowIcon}>🏪</Text>
          <Text style={previewStyles.rowText}>{pickup.label}</Text>
        </View>
      )}
      {dropoff && (
        <View style={previewStyles.row}>
          <Text style={previewStyles.rowIcon}>📍</Text>
          <Text style={previewStyles.rowText}>{dropoff.label}</Text>
        </View>
      )}
      {instructions ? (
        <View style={previewStyles.row}>
          <Text style={previewStyles.rowIcon}>✏️</Text>
          <Text style={[previewStyles.rowText, previewStyles.italic]} numberOfLines={2}>
            {instructions}
          </Text>
        </View>
      ) : null}
      <Text style={previewStyles.postedBy}>Posted by {CURRENT_USER.name} · Just now</Text>
    </Card>
  );
}

const previewStyles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: Colors.primary + '33',
    backgroundColor: Colors.accent,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  title: { ...Typography.headingSm, color: Colors.textPrimary, flex: 1, lineHeight: 21 },
  bountyPill: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  bountyText: { fontSize: 12, fontWeight: '800', color: Colors.goldDark },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 5,
  },
  rowIcon: { fontSize: 13, marginTop: 1 },
  rowText: { ...Typography.bodyMd, color: Colors.textSecondary, flex: 1 },
  italic: { fontStyle: 'italic' },
  postedBy: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.accentBorder,
    paddingTop: Spacing.sm,
  },
});

// ─── SuccessScreen ────────────────────────────────────────────────────────────
function SuccessScreen({ item, pickup, dropoff, bounty, mode, onPostAnother, onGoHome }) {
  return (
    <ScrollView contentContainerStyle={successStyles.container}>
      <View style={successStyles.iconWrap}>
        <Text style={successStyles.icon}>🚀</Text>
      </View>
      <Text style={successStyles.heading}>Quest Posted!</Text>
      <Text style={successStyles.subText}>
        Your quest is now live on the campus radar. A Quester near Sachi Street will pick it up soon.
      </Text>

      <Card style={successStyles.summaryCard} padding="md">
        <Text style={successStyles.summaryItem} numberOfLines={2}>{item}</Text>
        <View style={successStyles.summaryRow}>
          <Text style={successStyles.summaryIcon}>🏪</Text>
          <Text style={successStyles.summaryText}>{pickup?.label}</Text>
        </View>
        <View style={successStyles.summaryRow}>
          <Text style={successStyles.summaryIcon}>📍</Text>
          <Text style={successStyles.summaryText}>{dropoff?.label}</Text>
        </View>
        <View style={successStyles.bountyRow}>
          <Text style={successStyles.bountyLabel}>Bounty</Text>
          <Text style={successStyles.bountyValue}>
            {mode === 'qp' ? `${bounty} QP` : `₹${bounty}`}
          </Text>
        </View>
      </Card>

      <PrimaryButton label="Post Another Quest" onPress={onPostAnother} variant="outlined" style={successStyles.btn} />
      <PrimaryButton label="Go to Home" onPress={onGoHome} variant="ghost" style={successStyles.btn} />
    </ScrollView>
  );
}

const successStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  icon: { fontSize: 42 },
  heading: { ...Typography.headingLg, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subText: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  summaryCard: { width: '100%', marginBottom: Spacing.xl },
  summaryItem: { ...Typography.headingSm, color: Colors.textPrimary, marginBottom: Spacing.sm },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  summaryIcon: { fontSize: 13 },
  summaryText: { ...Typography.bodyMd, color: Colors.textSecondary },
  bountyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  bountyLabel: { ...Typography.label, color: Colors.textSecondary },
  bountyValue: { fontSize: 16, fontWeight: '800', color: Colors.goldDark },
  btn: { marginBottom: Spacing.sm, width: '100%' },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Layout.tabBarHeight + Spacing.xl,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
    ...Shadow.sm,
  },
  inputMulti: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  inputRoom: {
    marginTop: Spacing.sm,
    height: Layout.inputHeight,
    paddingVertical: 0,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Bounty mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Bounty display
  bountyDisplay: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bountyValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.goldDark,
    letterSpacing: -0.5,
  },
  bountyHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Slider
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sliderMin: { fontSize: 11, color: Colors.textMuted, width: 40 },
  sliderMax: { fontSize: 11, color: Colors.textMuted, width: 50, textAlign: 'right' },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    position: 'relative',
    overflow: 'visible',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    top: -10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.gold,
    marginLeft: -13,
    ...Shadow.md,
  },

  // Quick bounty chips
  quickBounty: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  quickChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  quickChipActive: {
    backgroundColor: Colors.goldLight,
    borderColor: Colors.gold,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  quickChipTextActive: {
    color: Colors.goldDark,
    fontWeight: '700',
  },

  // Preview
  previewSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  previewLabel: {
    ...Typography.overline,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },

  // Submit
  submitSection: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  validationHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
