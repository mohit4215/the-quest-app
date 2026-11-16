/**
 * Quest App — Design System: "Dynamic Duality"
 * Theme: OLED Black (#000000) with Dynamic Mode Shifting
 * 
 * - 🛋️ Lazy Mode (Requester): Electric Purple (#7C3AED) on Deep Violet (#1A1625)
 * - 🏃 Quester Mode (Courier): Neon Emerald (#10B981) on Deep Emerald (#13251E)
 */

export const Colors = {
  // Global OLED Dark Backgrounds
  background: '#000000',          // True OLED Black for midnight battery saving & neon pop
  surface: '#121217',             // Neutral elevated card
  surfaceAlt: '#181820',
  surfaceElevated: '#22222E',

  // ── 🛋️ Lazy Mode (Requester: Relaxed, effortless, premium) ──
  lazyMode: '#7C3AED',            // Electric Purple
  lazyModeLight: '#A78BFA',
  lazyModeDark: '#5B21B6',
  lazyModeSurface: '#1A1625',     // Deep violet-tinted dark surface card
  lazyModeSurfaceElevated: '#261F36',
  lazyModeBg: 'rgba(124, 58, 237, 0.15)',
  lazyModeBorder: 'rgba(124, 58, 237, 0.35)',
  lazyModeGlow: 'rgba(124, 58, 237, 0.40)',

  // ── 🏃 Quester Mode (Courier: Action-oriented, gamified, urgent) ──
  questerMode: '#10B981',         // Neon Emerald
  questerModeLight: '#34D399',
  questerModeDark: '#059669',
  questerModeSurface: '#13251E',  // Deep emerald-tinted dark surface card
  questerModeSurfaceElevated: '#1A3329',
  questerModeBg: 'rgba(16, 185, 129, 0.15)',
  questerModeBorder: 'rgba(16, 185, 129, 0.35)',
  questerModeGlow: 'rgba(16, 185, 129, 0.40)',

  // Lemon Yellow Logo & Brand Accent
  lemonYellow: '#FAEA48',
  lemonYellowDark: '#EAB308',
  lemonYellowLight: '#FEF9C3',

  // Brand Primaries
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#A78BFA',

  // Quest Points (QP) Gold & Glow Aura
  gold: '#F59E0B',
  goldLight: '#FEF3C7',
  goldDark: '#D97706',
  goldBorder: 'rgba(245, 158, 11, 0.4)',
  goldText: '#FBBF24',
  goldGlow: 'rgba(245, 158, 11, 0.25)',

  // Status & Utility Colors
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.2)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.2)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.2)',

  // Neutrals (High-Contrast Dark Theme)
  textPrimary: '#F8FAFC',         // Off-white primary text
  textSecondary: '#94A3B8',       // Slate gray secondary text
  textMuted: '#64748B',           // Muted captions & placeholders
  textInverse: '#000000',         // Inverse on bright badges

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.10)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Live Radar & Map Colors
  radarGrid: 'rgba(255, 255, 255, 0.06)',
  radarRing: 'rgba(16, 185, 129, 0.20)',
  radarPulse: 'rgba(16, 185, 129, 0.40)',
  radarCenter: '#10B981',
  radarGateHotspot: '#EF4444',    // Glowing red dot for urgent gate parcels
  hotspot: '#F59E0B',
  hotspotLight: 'rgba(245, 158, 11, 0.20)',

  // Overlays & Modals
  overlay: 'rgba(0, 0, 0, 0.85)',
  overlayFrosted: 'rgba(18, 18, 23, 0.75)',

  // Bottom Tab Bar
  tabActiveLazy: '#7C3AED',
  tabActiveQuester: '#10B981',
  tabInactive: '#64748B',
  tabBackground: '#09090C',
  tabBorder: 'rgba(255, 255, 255, 0.08)',
};

export default Colors;
