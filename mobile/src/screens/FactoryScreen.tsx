import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useAuthStore } from '../store/authStore';
import { useFactoryBatches, useFactoryReadings } from '../hooks/useReadings';
import { fmtDate } from '../lib/format';
import { theme } from '../theme';
import { BatchListItem } from '../types';

const isActive = (b: BatchListItem) => b.glp === null || b.glp === undefined;

export default function FactoryScreen() {
  const factoryId = useAuthStore(s => s.factoryId);
  const { readings, loading: rLoading, refresh: rRefresh } = useFactoryReadings(factoryId, 30000, 50);
  const { batches, loading: bLoading, refresh: bRefresh } = useFactoryBatches(factoryId, 30000);
  const [refreshing, setRefreshing] = useState(false);

  const devices = useMemo(() => {
    const map = new Map<string, string>();
    readings.forEach(r => {
      if (r.deviceId && (!map.has(r.deviceId) || r.timestamp > (map.get(r.deviceId) || ''))) {
        map.set(r.deviceId, r.timestamp);
      }
    });
    return Array.from(map.entries()).map(([deviceId, lastSeen]) => ({ deviceId, lastSeen }));
  }, [readings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([rRefresh(), bRefresh()]);
    setRefreshing(false);
  };

  const ongoing = batches.filter(isActive).length;
  const completed = batches.length - ongoing;

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.title}>Factory {factoryId}</Text>
        <Text style={styles.headerMuted}>Operational overview</Text>
      </View>

      <View style={[styles.row, { marginTop: theme.spacing.lg }]}>
        <MetricCard label="Total Batches" value={batches.length} accent={theme.colors.primary} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard label="Devices" value={devices.length} accent={theme.colors.info} />
      </View>
      <View style={[styles.row, { marginTop: theme.spacing.md }]}>
        <MetricCard label="Ongoing" value={ongoing} accent={theme.colors.warning} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard label="Completed" value={completed} accent={theme.colors.success} />
      </View>

      <Text style={styles.section}>Connected Devices</Text>
      {rLoading && devices.length === 0 ? <Loading /> : null}
      {!rLoading && devices.length === 0 ? (
        <Card>
          <EmptyState title="No devices" message="No recent device activity." />
        </Card>
      ) : null}
      {devices.map(d => (
        <Card key={d.deviceId} style={styles.listCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.itemTitle}>{d.deviceId}</Text>
              <Text style={styles.muted}>Last seen: {fmtDate(d.lastSeen)}</Text>
            </View>
            <Badge label="Live" variant="live" />
          </View>
        </Card>
      ))}

      <Text style={styles.section}>Recent Batch Activity</Text>
      {bLoading && batches.length === 0 ? <Loading /> : null}
      {!bLoading && batches.length === 0 ? (
        <Card>
          <EmptyState title="No activity" />
        </Card>
      ) : null}
      {batches.slice(0, 6).map(b => (
        <Card key={b.batchId} style={styles.listCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{b.batchId}</Text>
              <Text style={styles.muted}>{fmtDate(b.lastTimestamp)}</Text>
            </View>
            {isActive(b) ? (
              <Badge label="Ongoing" variant="ongoing" />
            ) : (
              <Badge label="Completed" variant="completed" />
            )}
          </View>
          <View style={[styles.sensorRow, { marginTop: theme.spacing.sm }]}>
            <Pill label={`T ${fmtValue(b.latestTemperature)}°C`} />
            <Pill label={`RG ${fmtValue(b.latestRgRatio)}`} />
            <Pill label={`MQ137 ${fmtValue(b.latestMq137, 0)}`} />
            <Pill label={`TGS2620 ${fmtValue(b.latestTgs2620, 0)}`} />
            <Pill label={`TGS822 ${fmtValue(b.latestTgs822, 0)}`} />
          </View>
        </Card>
      ))}

      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
    </SafeAreaView>
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
  row: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sensorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  section: {
    fontSize: theme.font.h3,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  listCard: {
    marginBottom: theme.spacing.md,
  },
  itemTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.text },
  pill: {
    backgroundColor: theme.colors.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.75)',
  },
  pillText: { color: theme.colors.primaryDark, fontSize: theme.font.tiny, fontWeight: '600' },
});

function fmtValue(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}
