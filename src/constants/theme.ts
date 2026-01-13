import { Platform } from 'react-native';

/**
 * Lightweight design tokens for a clean, mobile-first UI.
 * Keep this file dependency-free so it works everywhere (iOS/Android/Web).
 */

export const colors = {
  background: '#FBF7F0', // warm cream
  surface: '#FFFFFF',
  text: '#1F2937',
  mutedText: '#6B7280',
  border: '#E7E1D6',
  primary: '#1D4ED8',
  primarySoft: '#E6EEFF',
  success: '#059669',
  danger: '#DC2626',
  bubbleUser: '#1D4ED8',
  bubbleUserText: '#FFFFFF',
  bubbleBot: '#FFFFFF',
  bubbleBotText: '#1F2937',
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const typography = {
  title: 20,
  subtitle: 16,
  body: 14,
  small: 12,
};

/**
 * Shadows that look decent on mobile and don't break web.
 * Web ignores shadow props in RNW, but it's safe to include.
 */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  android: {
    elevation: 2,
  },
  default: {
    // web
  },
});

