import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { colors, radii, spacing, typography } from '../constants/theme';

/**
 * Web-safe typing indicator using Moti (Reanimated).
 * Kept as a simple animated ellipsis to avoid native-only APIs.
 */
export function TypingIndicator({ label }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.label}>{label ?? 'Typing'}</Text>
        <View style={styles.dots}>
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0.25, translateY: 0 }}
      animate={{ opacity: 1, translateY: -2 }}
      transition={{
        type: 'timing',
        duration: 450,
        loop: true,
        repeatReverse: true,
        delay,
      }}
      style={styles.dot}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: spacing.xs,
  },
  bubble: {
    maxWidth: '86%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    borderTopLeftRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.mutedText,
  },
});

