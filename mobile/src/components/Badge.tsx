import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type Variant = 'live' | 'ongoing' | 'completed' | 'priced' | 'neutral';

interface Props {
  label: string;
  variant?: Variant;
}

const palette: Record<Variant, { bg: string; fg: string }> = {
  live: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark },
  ongoing: { bg: theme.colors.warningSoft, fg: '#B45309' },
  completed: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark },
  priced: { bg: theme.colors.accentSoft, fg: '#1D4ED8' },
  neutral: { bg: theme.colors.subtle, fg: theme.colors.textSecondary },
};

export default function Badge({ label, variant = 'neutral' }: Props) {
  const c = palette[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {variant === 'live' && <View style={styles.dot} />}
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.72)',
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 5,
  },
});
