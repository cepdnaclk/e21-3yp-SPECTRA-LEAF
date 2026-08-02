import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useThemeStore } from '../theme';

interface Props {
  compact?: boolean;
  style?: ViewStyle;
}

export default function ThemeToggle({ compact = false, style }: Props) {
  const theme = useAppTheme();
  const toggleMode = useThemeStore(state => state.toggleMode);
  const isDark = theme.mode === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onPress={toggleMode}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={compact ? 18 : 19}
        color={theme.colors.primaryDark}
      />
      {!compact ? (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {isDark ? 'Light' : 'Dark'}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    minWidth: 86,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  compact: { width: 44, minWidth: 44, paddingHorizontal: 0 },
  label: { fontSize: 10, fontWeight: '900' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
});
