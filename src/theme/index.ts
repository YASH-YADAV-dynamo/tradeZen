export const COLORS = {
  bg: {
    primary: '#07110b',
    secondary: '#0d1711',
    elevated: '#111d17',
    card: 'rgba(9, 18, 13, 0.92)',
  },
  text: {
    primary: '#e8f5ea',
    secondary: '#b2c5b8',
    muted: '#6b8374',
  },
  border: {
    default: 'rgba(124, 170, 142, 0.16)',
    muted: 'rgba(124, 170, 142, 0.08)',
    accent: 'rgba(124, 170, 142, 0.3)',
  },
  green: {
    primary: '#33d17a',
    dim: 'rgba(51, 209, 122, 0.18)',
    subtle: 'rgba(51, 209, 122, 0.08)',
  },
  red: {
    primary: '#ff6b6b',
    dim: 'rgba(255, 107, 107, 0.18)',
    subtle: 'rgba(255, 107, 107, 0.08)',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const TYPOGRAPHY = {
  fonts: {
    heading: 'SpaceGrotesk_700Bold',
    body: 'SpaceGrotesk_500Medium',
    bodyRegular: 'SpaceGrotesk_400Regular',
    mono: 'JetBrainsMono_600SemiBold',
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 48,
  },
} as const;

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
