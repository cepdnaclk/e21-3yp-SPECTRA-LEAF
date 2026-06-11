import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    <Card style={[styles.card, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <View style={[styles.accent, { backgroundColor: tone.fg }]} />
      <Text style={[styles.label, { color: tone.muted }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: tone.fg }]}>{display}</Text>
        {unit ? <Text style={[styles.unit, { color: tone.muted }]}>{unit}</Text> : null}
      </View>
    </Card>
  );
}

function getTone(accent?: string) {
  if (accent === theme.colors.warning) {
    return { bg: theme.colors.panelAmber, border: '#FDE68A', fg: '#B45309', muted: '#92400E' };
  }
  if (accent === theme.colors.danger) {
    return { bg: theme.colors.panelRed, border: '#FECACA', fg: '#B91C1C', muted: '#991B1B' };
  }
  if (accent === theme.colors.info || accent === theme.colors.accent) {
    return { bg: theme.colors.panelBlue, border: '#BFDBFE', fg: '#1D4ED8', muted: '#1E40AF' };
  }
  if (accent === theme.colors.primary || accent === theme.colors.success) {
    return { bg: theme.colors.panelGreen, border: '#86EFAC', fg: theme.colors.primaryDark, muted: '#166534' };
  }
  return { bg: theme.colors.surface, border: 'rgba(255,255,255,0.74)', fg: theme.colors.text, muted: theme.colors.textMuted };
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    minHeight: 122,
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
