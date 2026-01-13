import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

export function ChatComposer({
  placeholder,
  disabled,
  onSend,
}: {
  placeholder: string;
  disabled?: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');

  const canSend = useMemo(() => !disabled && text.trim().length > 0, [disabled, text]);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        style={[styles.input, disabled ? styles.inputDisabled : null]}
        editable={!disabled}
        autoCorrect
        autoCapitalize="sentences"
        returnKeyType="send"
        onSubmitEditing={() => {
          if (!canSend) return;
          const t = text.trim();
          setText('');
          onSend(t);
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        onPress={() => {
          if (!canSend) return;
          const t = text.trim();
          setText('');
          onSend(t);
        }}
        style={({ pressed }) => [
          styles.send,
          !canSend ? styles.sendDisabled : null,
          pressed && canSend ? styles.sendPressed : null,
        ]}
      >
        <Text style={styles.sendText}>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  send: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  sendPressed: {
    opacity: 0.9,
  },
  sendDisabled: {
    backgroundColor: '#94A3B8',
  },
  sendText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: '700',
  },
});

