import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import LineChart from '../components/LineChart';
import { useAuthStore } from '../store/authStore';
import { useBatchReadings, useFactoryBatches } from '../hooks/useReadings';
import { useFermentationState } from '../hooks/useFermentationState';
import { fmtDate, fmtNumber } from '../lib/format';
import { SensorReading } from '../types';
import { AppTheme, useAppTheme } from '../theme';

const metrics = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'thermometer-outline' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: 'water-outline' },
  { key: 'rgRatio', label: 'RG Ratio', unit: '', icon: 'color-filter-outline' },
  { key: 'mq137', label: 'MQ137', unit: '', icon: 'cloud-outline' },
  { key: 'tgs2620', label: 'TGS2620', unit: '', icon: 'analytics-outline' },
  { key: 'tgs822', label: 'TGS822', unit: '', icon: 'speedometer-outline' },
] as const;

type TrendMetric = 'temperature' | 'humidity' | 'rgRatio';
const trendOptions: { key: TrendMetric; label: string; unit: string }[] = [
  { key: 'temperature', label: 'Temp', unit: '°C' },
  { key: 'humidity', label: 'Humidity', unit: '%' },
  { key: 'rgRatio', label: 'RG Ratio', unit: '' },
];

function valueOf(reading: SensorReading | undefined, key: typeof metrics[number]['key']) {
  const value = reading?.[key];
  return value == null ? '—' : fmtNumber(value, key.startsWith('tgs') || key === 'mq137' ? 0 : 1);
}

export default function SensorsScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const factoryId = useAuthStore(state => state.factoryId);
  const { batches, refresh: refreshBatches } = useFactoryBatches(factoryId, 5_000);
  const { isLive, state: liveState, refresh: refreshLive } = useFermentationState(factoryId, 1_000);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const scopedBatchId = isLive && liveState?.batchId
    ? liveState.batchId
    : selectedBatchId || liveState?.batchId || batches[0]?.batchId || null;
  const { readings, loading, error, refresh } = useBatchReadings(scopedBatchId, 1_000);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('temperature');

  useEffect(() => {
    if (isLive && liveState?.batchId) setSelectedBatchId(liveState.batchId);
  }, [isLive, liveState?.batchId]);

  const latest = readings[readings.length - 1];
  const recentReadings = useMemo(() => [...readings].reverse(), [readings]);
  const trendPoints = useMemo(
    () => readings
      .map(reading => ({ timestamp: reading.timestamp, value: reading[trendMetric] }))
      .filter((point): point is { timestamp: string; value: number } => point.value != null),
    [readings, trendMetric],
  );
  const trendOption = trendOptions.find(option => option.key === trendMetric)!;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshBatches(), refreshLive()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>CHAMBER INTELLIGENCE</Text>
            <Text style={styles.title}>Sensor stream</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="pulse-outline" size={22} color={theme.colors.primary} />
          </View>
        </View>

        <View style={[styles.streamBar, isLive && styles.streamBarLive]}>
          <View style={styles.streamIcon}>
            <Ionicons
              name={isLive ? 'radio' : 'pause'}
              size={18}
              color={isLive ? '#031008' : theme.colors.textMuted}
            />
          </View>
          <View style={styles.streamCopy}>
            <Text style={[styles.streamTitle, isLive && styles.streamTitleLive]}>
              {isLive
                ? `${liveState?.batchId ?? 'Batch'} is streaming`
                : scopedBatchId
                  ? `${scopedBatchId} batch history`
                  : 'No batch selected'}
            </Text>
            <Text style={[styles.streamMeta, isLive && styles.streamMetaLive]}>
              {latest?.deviceId || liveState?.deviceId || 'No device'} · {fmtDate(latest?.timestamp) || 'No signal yet'}
            </Text>
          </View>
          <Badge label={isLive ? 'Live' : 'Batch'} variant={isLive ? 'live' : 'neutral'} />
        </View>

        <View style={styles.batchSelectorHeader}>
          <Text style={styles.sectionKicker}>{isLive ? 'LIVE BATCH' : 'READING BATCH'}</Text>
          <Text style={styles.batchSelectorMeta}>{scopedBatchId ?? 'No batch'}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.batchSelector}
        >
          {scopedBatchId && !batches.some(batch => batch.batchId === scopedBatchId) ? (
            <View style={[styles.batchChip, styles.batchChipActive]}>
              <Text style={[styles.batchChipText, styles.batchChipTextActive]}>{scopedBatchId}</Text>
            </View>
          ) : null}
          {batches.map(batch => {
            const selected = batch.batchId === scopedBatchId;
            return (
              <Pressable
                key={batch.batchId}
                disabled={isLive}
                onPress={() => setSelectedBatchId(batch.batchId)}
                style={({ pressed }) => [
                  styles.batchChip,
                  selected && styles.batchChipActive,
                  pressed && !isLive && styles.pressed,
                ]}
              >
                <Text style={[styles.batchChipText, selected && styles.batchChipTextActive]}>
                  {batch.batchId}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? (
          <Pressable onPress={onRefresh} style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={19} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>LATEST BATCH READING</Text>
            <Text style={styles.sectionTitle}>Six-sensor view</Text>
          </View>
          <Text style={styles.autoRefresh}>AUTO · 1 SEC</Text>
        </View>

        {loading && readings.length === 0 ? <Loading label="Reading chamber sensors" /> : null}

        <View style={styles.metricGrid}>
          {metrics.map((metric, index) => (
            <View
              key={metric.key}
              style={[
                styles.metricCard,
                metric.key === 'humidity' && styles.metricCardFeatured,
              ]}
            >
              <View style={styles.metricTop}>
                <Ionicons
                  name={metric.icon}
                  size={19}
                  color={metric.key === 'humidity' ? '#031008' : theme.colors.primary}
                />
                <Text style={[
                  styles.metricIndex,
                  metric.key === 'humidity' && styles.metricIndexFeatured,
                ]}>
                  0{index + 1}
                </Text>
              </View>
              <Text style={[
                styles.metricValue,
                metric.key === 'humidity' && styles.metricValueFeatured,
              ]}>
                {valueOf(latest, metric.key)}
                {latest?.[metric.key] != null && metric.unit ? (
                  <Text style={styles.metricUnit}> {metric.unit}</Text>
                ) : null}
              </Text>
              <Text style={[
                styles.metricLabel,
                metric.key === 'humidity' && styles.metricLabelFeatured,
              ]}>
                {metric.label}
              </Text>
            </View>
          ))}
        </View>

        <Card style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.sectionKicker}>{isLive ? 'LIVE ANALYSIS' : 'BATCH ANALYSIS'}</Text>
              <Text style={styles.trendTitle}>{trendOption.label} signal</Text>
            </View>
            <Text style={styles.trendCount}>{trendPoints.length} PTS</Text>
          </View>
          <View style={styles.trendTabs}>
            {trendOptions.map(option => (
              <Pressable
                key={option.key}
                onPress={() => setTrendMetric(option.key)}
                style={[styles.trendTab, trendMetric === option.key && styles.trendTabActive]}
              >
                <Text
                  style={[
                    styles.trendTabText,
                    trendMetric === option.key && styles.trendTabTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <LineChart
            points={trendPoints}
            height={165}
            unit={trendOption.unit}
            color={theme.colors.primaryDark}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>SIGNAL LOG</Text>
            <Text style={styles.sectionTitle}>Recent telemetry</Text>
          </View>
          <Text style={styles.sampleCount}>{readings.length} batch readings</Text>
        </View>

        {!loading && readings.length === 0 ? (
          <Card>
            <EmptyState title="No telemetry yet" message="Start fermentation to populate the live signal log." />
          </Card>
        ) : null}

        {recentReadings.map((reading, index) => {
          const key = `${reading.timestamp}-${index}`;
          const open = expanded === key;
          return (
            <Pressable
              key={key}
              onPress={() => setExpanded(open ? null : key)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <View style={[styles.logRow, open && styles.logRowOpen]}>
                <View style={styles.timeline}>
                  <View style={[styles.timelineDot, index === 0 && styles.timelineDotLive]} />
                  {index < recentReadings.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.logBody}>
                  <View style={styles.logTop}>
                    <View>
                      <Text style={styles.logTime}>{fmtDate(reading.timestamp)}</Text>
                      <Text style={styles.logMeta}>{reading.deviceId} · {reading.batchId || 'No batch'}</Text>
                    </View>
                    <View style={styles.quickReading}>
                      <Text style={styles.quickValue}>{valueOf(reading, 'humidity')}%</Text>
                      <Ionicons
                        name={open ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color={theme.colors.textMuted}
                      />
                    </View>
                  </View>
                  {open ? (
                    <View style={styles.expandedGrid}>
                      {metrics.map(metric => (
                        <View key={metric.key} style={styles.expandedMetric}>
                          <Text style={styles.expandedLabel}>{metric.label}</Text>
                          <Text style={styles.expandedValue}>
                            {valueOf(reading, metric.key)}{metric.unit}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  kicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 4 },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
  },
  streamBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
  },
  streamBarLive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  streamIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamCopy: { flex: 1, marginHorizontal: 11 },
  streamTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900' },
  streamTitleLive: { color: '#031008' },
  streamMeta: { color: theme.colors.textMuted, fontSize: 9, marginTop: 3 },
  streamMetaLive: { color: '#1D5A35' },
  batchSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  batchSelectorMeta: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900' },
  batchSelector: { gap: 8, paddingTop: 10, paddingRight: 4 },
  batchChip: {
    minWidth: 76,
    height: 35,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  batchChipText: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900' },
  batchChipTextActive: { color: '#031008' },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    padding: 13,
    marginTop: 12,
  },
  errorText: { color: theme.colors.dangerText, fontSize: 11, flex: 1, marginHorizontal: 9 },
  retry: { color: theme.colors.text, fontSize: 11, fontWeight: '900' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 14,
  },
  sectionKicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  sectionTitle: { color: theme.colors.text, fontSize: 21, fontWeight: '900', marginTop: 4 },
  autoRefresh: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  sampleCount: { color: theme.colors.textMuted, fontSize: 10, marginBottom: 4 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    width: '48.5%',
    minHeight: 150,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    justifyContent: 'space-between',
  },
  metricCardFeatured: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricIndex: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '900' },
  metricIndexFeatured: { color: '#1D5A35' },
  metricValue: { color: theme.colors.text, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  metricValueFeatured: { color: '#031008' },
  metricUnit: { fontSize: 12, fontWeight: '700' },
  metricLabel: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 0.9, textTransform: 'uppercase' },
  metricLabelFeatured: { color: '#1D5A35' },
  trendCard: { marginTop: 12, borderRadius: 25, padding: 17 },
  trendHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  trendTitle: { color: theme.colors.text, fontSize: 19, fontWeight: '900', marginTop: 4 },
  trendCount: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900' },
  trendTabs: { flexDirection: 'row', gap: 6, marginTop: 16, marginBottom: 8 },
  trendTab: {
    flex: 1,
    height: 31,
    borderRadius: 11,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendTabActive: { backgroundColor: theme.colors.primary },
  trendTabText: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900' },
  trendTabTextActive: { color: theme.colors.ink },
  logRow: { flexDirection: 'row', minHeight: 78 },
  logRowOpen: { minHeight: 190 },
  timeline: { width: 24, alignItems: 'center' },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.borderActive,
    marginTop: 19,
  },
  timelineDotLive: { backgroundColor: theme.colors.primary },
  timelineLine: { width: 1, flex: 1, backgroundColor: theme.colors.border, marginTop: 5 },
  logBody: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 8,
  },
  logTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logTime: { color: theme.colors.text, fontSize: 12, fontWeight: '900' },
  logMeta: { color: theme.colors.textMuted, fontSize: 9, marginTop: 4 },
  quickReading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickValue: { color: theme.colors.primary, fontSize: 15, fontWeight: '900' },
  expandedGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, gap: 8 },
  expandedMetric: {
    width: '31.5%',
    backgroundColor: theme.colors.elevated,
    borderRadius: 12,
    padding: 9,
  },
  expandedLabel: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  expandedValue: { color: theme.colors.text, fontSize: 12, fontWeight: '900', marginTop: 4 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
  bottomSpace: { height: 130 },
});
