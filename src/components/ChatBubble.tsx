import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { Role } from '../types/marketing';

export function ChatBubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textBot]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUser,
    borderColor: colors.bubbleUser,
    borderTopRightRadius: radii.sm,
  },
  bubbleBot: {
    backgroundColor: colors.bubbleBot,
    borderColor: colors.border,
    borderTopLeftRadius: radii.sm,
  },
  text: {
    fontSize: typography.body,
    lineHeight: typography.body * 1.35,
  },
  textUser: {
    color: colors.bubbleUserText,
  },
  textBot: {
    color: colors.bubbleBotText,
  },
});

