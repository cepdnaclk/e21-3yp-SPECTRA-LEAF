import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { AppTheme, useAppTheme } from '../theme';

interface Props {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  accent?: string;
}

export default function MetricCard({ label, value, unit, accent }: Props) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <Card style={styles.card}>
      <View style={[styles.rail, { backgroundColor: accent ?? theme.colors.primary }]} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, accent ? { color: accent } : null]}>{display}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </Card>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  rail: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.font.tiny,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '900',
  },
  unit: {
    color: theme.colors.textMuted,
    marginLeft: 4,
    marginBottom: 4,
    fontSize: theme.font.small,
  },
});
