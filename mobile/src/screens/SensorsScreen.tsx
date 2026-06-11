import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { useAuthStore } from '../store/authStore';
import { useFactoryReadings } from '../hooks/useReadings';
import { fmtDate, fmtNumber } from '../lib/format';
import { theme } from '../theme';

function fmt(n: number | null | undefined, d = 1) {
  return fmtNumber(n, d);
}

export default function SensorsScreen() {
  const factoryId = useAuthStore(s => s.factoryId);
  const { readings, loading, error, refresh } = useFactoryReadings(factoryId, 15000, 30);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const latest = readings[0];

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.title}>Live Sensors</Text>
        <Text style={styles.headerMuted}>Auto-refresh every 15s · Factory {factoryId}</Text>
      </View>

      {error ? (
        <Card style={{ marginTop: theme.spacing.md, borderColor: theme.colors.danger }}>
          <Text style={{ color: theme.colors.danger }}>{error}</Text>
        </Card>
      ) : null}

      <View style={[styles.row, { marginTop: theme.spacing.lg }]}>
        <MetricCard label="Temperature" value={fmt(latest?.temperature)} unit="°C" accent={theme.colors.primary} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard label="RG Ratio" value={fmt(latest?.rgRatio)} accent={theme.colors.info} />
      </View>
      <View style={[styles.row, { marginTop: theme.spacing.md }]}>
        <MetricCard label="MQ137" value={fmt(latest?.mq137, 0)} accent={theme.colors.warning} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard label="TGS2620" value={fmt(latest?.tgs2620, 0)} accent={theme.colors.danger} />
      </View>
      <View style={[styles.row, { marginTop: theme.spacing.md }]}>
        <MetricCard label="TGS822" value={fmt(latest?.tgs822, 0)} accent={theme.colors.primary} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard label="Device" value={latest?.deviceId || '—'} accent={theme.colors.info} />
      </View>

      <Text style={styles.section}>Recent Readings</Text>
      {loading && readings.length === 0 ? <Loading /> : null}
      {!loading && readings.length === 0 ? (
        <Card>
          <EmptyState title="No readings yet" message="Sensor readings will appear here." />
        </Card>
      ) : null}

      {readings.map((r, i) => (
        <Card key={`${r.timestamp}-${i}`} style={styles.readingCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.timestamp}>{fmtDate(r.timestamp)}</Text>
            <Text style={styles.muted}>{r.deviceId}</Text>
          </View>
          <Text style={styles.muted}>Batch: {r.batchId || '—'}</Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Stat label="Temp" value={`${fmt(r.temperature)}°C`} />
            <Stat label="RG" value={fmt(r.rgRatio)} />
            <Stat label="MQ137" value={fmt(r.mq137, 0)} />
            <Stat label="TGS2620" value={fmt(r.tgs2620, 0)} />
            <Stat label="TGS822" value={fmt(r.tgs822, 0)} />
          </View>
        </Card>
      ))}

      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 132,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  headerCard: {
    backgroundColor: theme.colors.dark,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  headerMuted: { color: theme.colors.darkMuted, fontSize: theme.font.small, lineHeight: 19, marginTop: 6 },
  muted: { color: theme.colors.textMuted, fontSize: theme.font.small, lineHeight: 19 },
  section: {
    fontSize: theme.font.h3,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestamp: { color: theme.colors.text, fontWeight: '600', fontSize: theme.font.small },
  readingCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  stat: {
    backgroundColor: theme.colors.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.75)',
  },
  statLabel: { color: theme.colors.textMuted, fontSize: theme.font.tiny },
  statValue: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: theme.font.small },
});
