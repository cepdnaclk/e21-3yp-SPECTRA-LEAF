import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from './Card';
import { theme } from '../theme';

interface Props {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  accent?: string;
}

export default function MetricCard({ label, value, unit, accent }: Props) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  const tone = getTone(accent);
  return (
    <Card padded={false} style={[styles.card, { borderColor: tone.border }]}>
      <LinearGradient colors={tone.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
        <View style={[styles.accent, { backgroundColor: tone.fg }]} />
        <Text style={[styles.label, { color: tone.muted }]}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: tone.fg }]}>{display}</Text>
          {unit ? <Text style={[styles.unit, { color: tone.muted }]}>{unit}</Text> : null}
        </View>
      </LinearGradient>
    </Card>
  );
}

function getTone(accent?: string) {
  if (accent === theme.colors.warning) {
    return {
      border: '#111111',
      fg: '#FFFFFF',
      muted: theme.colors.darkMuted,
      gradient: ['#050505', '#171717'] as const,
    };
  }
  if (accent === theme.colors.danger) {
    return {
      border: '#FECACA',
      fg: '#B91C1C',
      muted: '#991B1B',
      gradient: ['rgba(254,242,242,0.98)', 'rgba(255,228,230,0.78)'] as const,
    };
  }
  if (accent === theme.colors.info || accent === theme.colors.accent) {
    return {
      border: '#111111',
      fg: '#FFFFFF',
      muted: theme.colors.darkMuted,
      gradient: ['#050505', '#202020'] as const,
    };
  }
  if (accent === theme.colors.primary || accent === theme.colors.success) {
    return {
      border: '#86EFAC',
      fg: theme.colors.primaryDark,
      muted: '#166534',
      gradient: ['rgba(220,252,231,0.98)', 'rgba(187,247,208,0.76)'] as const,
    };
  }
  return {
    border: theme.colors.border,
    fg: theme.colors.text,
    muted: theme.colors.textMuted,
    gradient: ['#FFFFFF', '#F7F8FA'] as const,
  };
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    minHeight: 122,
  },
  inner: {
    flex: 1,
    padding: 18,
  },
  accent: {
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginBottom: theme.spacing.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  unit: {
    color: theme.colors.textMuted,
    marginLeft: 4,
    marginBottom: 4,
    fontSize: theme.font.small,
  },
});
