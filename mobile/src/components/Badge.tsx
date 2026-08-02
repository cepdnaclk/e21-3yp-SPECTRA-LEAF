import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';

type Variant = 'live' | 'ongoing' | 'completed' | 'priced' | 'neutral';

interface Props {
  label: string;
  variant?: Variant;
}

export default function Badge({ label, variant = 'neutral' }: Props) {
  const theme = useAppTheme();
  const palette: Record<Variant, { bg: string; fg: string }> = {
    live: { bg: theme.colors.primary, fg: theme.colors.ink },
    ongoing: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    completed: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark },
    priced: { bg: theme.colors.accent, fg: theme.colors.ink },
    neutral: { bg: theme.colors.subtle, fg: theme.colors.textSecondary },
  };
  const c = palette[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {variant === 'live' && <View style={[styles.dot, { backgroundColor: theme.colors.ink }]} />}
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
});
