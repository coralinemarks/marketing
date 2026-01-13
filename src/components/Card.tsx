import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { cardShadow, colors, radii, spacing } from '../constants/theme';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
});

