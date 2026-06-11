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
  return (
    <Card style={styles.card}>
      <View style={[styles.accent, accent ? { backgroundColor: accent } : null]} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, accent ? { color: accent } : null]}>{display}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    minHeight: 112,
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
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.font.h1,
    fontWeight: '700',
  },
  unit: {
    color: theme.colors.textMuted,
    marginLeft: 4,
    marginBottom: 4,
    fontSize: theme.font.small,
  },
});
