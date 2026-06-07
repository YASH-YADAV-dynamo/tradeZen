/**
 * Design tokens — the single source of truth for colors, type scale,
 * spacing, radius, motion, and elevation. Components MUST consume from
 * here (or via `src/theme`) — never hardcode hex codes or magic numbers.
 *
 * Naming follows the "semantic + scale" pattern: tokens describe intent
 * (`COLORS.text.muted`) so we can re-skin without touching components.
 */

// ── Color palette ──────────────────────────────────────────────────────────
// Brand: terminal-green on near-black. WCAG AA verified on `bg.primary`.

export const PALETTE = {
  // Grayscale (background ramp)
  black: '#04090a',
  ink: '#07110b',
  graphite: '#0d1711',
  slate: '#111d17',
  stone: '#1a2520',

  // Greens (action / positive)
  emerald: '#33d17a',
  emeraldDim: 'rgba(51, 209, 122, 0.18)',
  emeraldSubtle: 'rgba(51, 209, 122, 0.08)',
  forest: '#1f7a47',

  // Reds (warning / negative)
  crimson: '#ff6b6b',
  crimsonDim: 'rgba(255, 107, 107, 0.18)',
  crimsonSubtle: 'rgba(255, 107, 107, 0.08)',

  // Yellows / amber
  amber: '#ffc857',

  // Text ramp
  ice: '#e8f5ea',
  mist: '#b2c5b8',
  fog: '#6b8374',

  // Borders / dividers
  hairline: 'rgba(124, 170, 142, 0.16)',
  hairlineSoft: 'rgba(124, 170, 142, 0.08)',
  hairlineBold: 'rgba(124, 170, 142, 0.3)',
} as const;

export const COLORS = {
  bg: {
    primary: PALETTE.ink,
    secondary: PALETTE.graphite,
    elevated: PALETTE.slate,
    overlay: 'rgba(4, 9, 10, 0.72)',
    card: 'rgba(9, 18, 13, 0.92)',
    sheet: PALETTE.graphite,
  },
  text: {
    primary: PALETTE.ice,
    secondary: PALETTE.mist,
    muted: PALETTE.fog,
    inverse: PALETTE.ink,
    accent: PALETTE.emerald,
  },
  border: {
    default: PALETTE.hairline,
    muted: PALETTE.hairlineSoft,
    accent: PALETTE.hairlineBold,
  },
  green: {
    primary: PALETTE.emerald,
    dim: PALETTE.emeraldDim,
    subtle: PALETTE.emeraldSubtle,
    deep: PALETTE.forest,
  },
  red: {
    primary: PALETTE.crimson,
    dim: PALETTE.crimsonDim,
    subtle: PALETTE.crimsonSubtle,
  },
  amber: { primary: PALETTE.amber },
  chart: {
    line: PALETTE.emerald,
    fill: 'rgba(51, 209, 122, 0.12)',
    grid: 'rgba(124, 170, 142, 0.08)',
    axis: PALETTE.fog,
    cursor: PALETTE.ice,
  },
} as const;

// ── Type system ────────────────────────────────────────────────────────────
// Fonts are loaded in app/_layout.tsx via @expo-google-fonts/*.

export const FONTS = {
  /** Geometric sans-serif for headlines (Space Grotesk 700). */
  heading: 'SpaceGrotesk_700Bold',
  /** Neutral sans-serif for body copy (Inter 500). */
  body: 'Inter_500Medium',
  /** Body regular weight (Inter 400). */
  bodyRegular: 'Inter_400Regular',
  /** Bold body for emphasis (Inter 700). */
  bodyBold: 'Inter_700Bold',
  /** Tabular monospaced for prices / addresses (JetBrains Mono 600). */
  mono: 'JetBrainsMono_600SemiBold',
  /** Mono regular for less-emphasized numbers. */
  monoRegular: 'JetBrainsMono_400Regular',
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const;

export const LINE_HEIGHTS = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
} as const;

// ── Spacing / sizing ───────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 28,
  full: 9999,
} as const;

// ── Elevation / shadows ────────────────────────────────────────────────────

export const SHADOWS = {
  none: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -12 },
    elevation: 12,
  },
  green: {
    shadowColor: COLORS.green.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  red: {
    shadowColor: COLORS.red.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
} as const;

// ── Motion ─────────────────────────────────────────────────────────────────

export const MOTION = {
  durations: { fast: 120, base: 220, slow: 380 },
  easing: { standard: 'ease-in-out', emphasized: 'cubic-bezier(0.2, 0, 0, 1)' },
} as const;

// ── Z-index ────────────────────────────────────────────────────────────────

export const Z_INDEX = {
  base: 0,
  card: 1,
  header: 10,
  tabBar: 20,
  modal: 100,
  toast: 200,
} as const;

// ── Composed presets ───────────────────────────────────────────────────────
// Common style fragments — use these to avoid drift across files.

export const PRESETS = {
  heading: {
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  body: {
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  caption: {
    fontFamily: FONTS.bodyRegular,
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.xs,
  },
  numeric: {
    fontFamily: FONTS.mono,
    color: COLORS.text.primary,
  },
} as const;

// Back-compat alias — `TYPOGRAPHY` was the previous public name. New code
// should import FONTS / FONT_SIZES / FONT_WEIGHTS directly.
export const TYPOGRAPHY = {
  fonts: FONTS,
  sizes: FONT_SIZES,
  weights: FONT_WEIGHTS,
} as const;
