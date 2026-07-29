import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import LineChart from '../components/LineChart';
import { useAuthStore } from '../store/authStore';
import { useFactoryBatches } from '../hooks/useReadings';
import { useFermentationState } from '../hooks/useFermentationState';
import { fmtCurrency, fmtDate, fmtNumber } from '../lib/format';
import { BatchListItem } from '../types';
import { AppTheme, useAppTheme } from '../theme';

type Filter = 'ALL' | 'LIVE' | 'NEEDS GLP' | 'COMPLETED' | 'PRICED';
type AnalysisMetric = 'glp' | 'temperature' | 'humidity';
const filters: Filter[] = ['ALL', 'LIVE', 'NEEDS GLP', 'COMPLETED', 'PRICED'];
const analysisOptions: { key: AnalysisMetric; label: string; unit: string }[] = [
  { key: 'glp', label: 'Quality', unit: '%' },
  { key: 'temperature', label: 'Temp', unit: '°C' },
  { key: 'humidity', label: 'Humidity', unit: '%' },
];

export default function BatchesScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const factoryId = useAuthStore(state => state.factoryId);
  const { batches, loading, error, refresh } = useFactoryBatches(factoryId, 20_000);
  const { state: liveState, isLive, refresh: refreshLive } = useFermentationState(factoryId, 5_000);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [analysisMetric, setAnalysisMetric] = useState<AnalysisMetric>('glp');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => batches.filter(batch => {
    const live = isLive && liveState?.batchId === batch.batchId;
    if (filter === 'LIVE') return live;
    if (filter === 'NEEDS GLP') return batch.glp == null && !live;
    if (filter === 'COMPLETED') return batch.glp != null;
    if (filter === 'PRICED') return batch.price != null;
    return true;
  }), [batches, filter, isLive, liveState?.batchId]);

  const awaitingGlp = batches.filter(batch => batch.glp == null).length - (isLive ? 1 : 0);
  const priced = batches.filter(batch => batch.price != null).length;
  const analysisPoints = useMemo(
    () => batches
      .slice()
      .reverse()
      .map(batch => {
        const value =
          analysisMetric === 'glp'
            ? batch.glp
            : analysisMetric === 'temperature'
              ? batch.latestTemperature
              : batch.latestHumidity;
        return {
          timestamp: batch.lastTimestamp || batch.batchId,
          value,
        };
      })
      .filter((point): point is { timestamp: string; value: number } => point.value != null),
    [analysisMetric, batches],
  );
  const analysisOption = analysisOptions.find(option => option.key === analysisMetric)!;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshLive()]);
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
            <Text style={styles.kicker}>QUALITY PIPELINE</Text>
            <Text style={styles.title}>Batch ledger</Text>
            <Text style={styles.subtitle}>Factory {factoryId} · officer handoff</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="layers-outline" size={22} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryValue}>{String(batches.length).padStart(2, '0')}</Text>
            <Text style={styles.summaryLabel}>TOTAL BATCHES</Text>
          </View>
          <View style={styles.summaryDivider} />
          <SummaryStat label="Needs GLP" value={Math.max(awaitingGlp, 0)} />
          <SummaryStat label="Priced" value={priced} />
        </View>

        <Card style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <View>
              <Text style={styles.analysisKicker}>BATCH ANALYSIS</Text>
              <Text style={styles.analysisTitle}>{analysisOption.label} trend</Text>
            </View>
            <View style={styles.analysisIcon}>
              <Ionicons name="trending-up" size={18} color={theme.colors.primaryDark} />
            </View>
          </View>
          <View style={styles.analysisTabs}>
            {analysisOptions.map(option => (
              <Pressable
                key={option.key}
                onPress={() => setAnalysisMetric(option.key)}
                style={[
                  styles.analysisTab,
                  analysisMetric === option.key && styles.analysisTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.analysisTabText,
                    analysisMetric === option.key && styles.analysisTabTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <LineChart
            points={analysisPoints}
            height={152}
            unit={analysisOption.unit}
            color={theme.colors.primaryDark}
          />
          <Text style={styles.analysisCaption}>
            {analysisPoints.length} batches compared · oldest to newest
          </Text>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map(item => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={({ pressed }) => [
                styles.filter,
                filter === item && styles.filterActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{filter === 'ALL' ? 'Every batch' : filter.toLowerCase()}</Text>
          <Text style={styles.listCount}>{filtered.length} shown</Text>
        </View>

        {error ? (
          <Pressable onPress={onRefresh} style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        ) : null}

        {loading && batches.length === 0 ? <Loading label="Opening batch ledger" /> : null}

        {!loading && filtered.length === 0 ? (
          <Card>
            <EmptyState
              title="Nothing in this view"
              message={filter === 'ALL' ? 'New fermentation batches will appear here.' : 'Choose another filter.'}
            />
          </Card>
        ) : null}

        {filtered.map((batch, index) => (
          <Pressable
            key={batch.batchId}
            onPress={() => navigation.navigate('BatchDetail', { batchId: batch.batchId })}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <BatchCard
              batch={batch}
              index={index}
              live={isLive && liveState?.batchId === batch.batchId}
            />
          </Pressable>
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatValue}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.summaryStatLabel}>{label}</Text>
    </View>
  );
}

function BatchCard({ batch, live, index }: { batch: BatchListItem; live: boolean; index: number }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const status = live ? 'Live' : batch.glp != null ? 'Completed' : 'Needs GLP';
  const variant = live ? 'live' : batch.glp != null ? 'completed' : 'ongoing';
  return (
    <Card style={[styles.batchCard, live && styles.batchCardLive]}>
      <View style={styles.batchTop}>
        <View style={[styles.batchNumber, live && styles.batchNumberLive]}>
          <Text style={[styles.batchNumberText, live && styles.batchNumberTextLive]}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.batchTitleWrap}>
          <Text style={styles.batchId}>{batch.batchId}</Text>
          <Text style={styles.batchDate}>{fmtDate(batch.lastTimestamp) || 'Waiting for first sample'}</Text>
        </View>
        <Badge label={status} variant={variant} />
      </View>

      <View style={styles.readingRow}>
        <Reading label="TEMP" value={`${format(batch.latestTemperature)}°`} />
        <Reading label="HUMIDITY" value={`${format(batch.latestHumidity)}%`} />
        <Reading label="RG RATIO" value={format(batch.latestRgRatio)} />
      </View>

      <View style={styles.batchFooter}>
        <View>
          <Text style={styles.footerLabel}>QUALITY / PRICE</Text>
          <Text style={styles.footerValue}>
            {batch.glp != null ? `${batch.glp}% GLP` : 'GLP pending'}
            {batch.price != null ? ` · ${fmtCurrency(batch.price)}` : ''}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={17} color={live ? '#031008' : theme.colors.primary} />
        </View>
      </View>
    </Card>
  );
}

function Reading({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.reading}>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text style={styles.readingValue}>{value}</Text>
    </View>
  );
}

function format(value: number | null | undefined) {
  return value == null ? '—' : fmtNumber(value, 1);
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 },
  kicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 4 },
  subtitle: { color: theme.colors.textMuted, fontSize: 11, marginTop: 5 },
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
  summary: {
    minHeight: 125,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryMain: { flex: 1.2 },
  summaryValue: { color: '#031008', fontSize: 42, fontWeight: '900', letterSpacing: -1.5 },
  summaryLabel: { color: '#1D5A35', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  summaryDivider: { width: 1, height: 65, backgroundColor: 'rgba(3,16,8,0.18)', marginRight: 15 },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryStatValue: { color: '#031008', fontSize: 22, fontWeight: '900' },
  summaryStatLabel: { color: '#1D5A35', fontSize: 8, fontWeight: '800', marginTop: 5, textTransform: 'uppercase' },
  analysisCard: { marginTop: 12, padding: 17, borderRadius: 26 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  analysisKicker: { color: theme.colors.primaryDark, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  analysisTitle: { color: theme.colors.text, fontSize: 19, fontWeight: '900', marginTop: 4 },
  analysisIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTabs: { flexDirection: 'row', gap: 6, marginTop: 17, marginBottom: 9 },
  analysisTab: {
    flex: 1,
    height: 31,
    borderRadius: 11,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTabActive: { backgroundColor: theme.colors.primary },
  analysisTabText: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900' },
  analysisTabTextActive: { color: theme.colors.ink },
  analysisCaption: { color: theme.colors.textMuted, fontSize: 8, marginTop: 8, textAlign: 'center' },
  filters: { gap: 8, paddingVertical: 22 },
  filter: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  filterActive: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
  filterText: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  filterTextActive: { color: '#031008' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  listTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '900', textTransform: 'capitalize' },
  listCount: { color: theme.colors.textMuted, fontSize: 10 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    padding: 13,
    marginBottom: 12,
  },
  errorText: { color: theme.colors.dangerText, fontSize: 11, flex: 1, marginHorizontal: 9 },
  retry: { color: theme.colors.text, fontSize: 11, fontWeight: '900' },
  batchCard: { marginBottom: 10, borderRadius: 24 },
  batchCardLive: { borderColor: '#2D7A4B' },
  batchTop: { flexDirection: 'row', alignItems: 'center' },
  batchNumber: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchNumberLive: { backgroundColor: theme.colors.primary },
  batchNumberText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '900' },
  batchNumberTextLive: { color: '#031008' },
  batchTitleWrap: { flex: 1, marginHorizontal: 11 },
  batchId: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
  batchDate: { color: theme.colors.textMuted, fontSize: 9, marginTop: 3 },
  readingRow: { flexDirection: 'row', gap: 7, marginTop: 18 },
  reading: {
    flex: 1,
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: theme.colors.elevated,
    padding: 10,
  },
  readingLabel: { color: theme.colors.textMuted, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  readingValue: { color: theme.colors.text, fontSize: 14, fontWeight: '900', marginTop: 7 },
  batchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 16,
    paddingTop: 14,
  },
  footerLabel: { color: theme.colors.textMuted, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  footerValue: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 4 },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.74, transform: [{ scale: 0.992 }] },
  bottomSpace: { height: 116 },
});
