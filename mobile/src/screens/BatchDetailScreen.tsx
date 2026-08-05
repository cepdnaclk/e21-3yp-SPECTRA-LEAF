import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import LineChart from '../components/LineChart';
import { useBatchGraphs, useBatchSummary } from '../hooks/useBatch';
import { useAuthStore } from '../store/authStore';
import { publishFermentationState, useFermentationState } from '../hooks/useFermentationState';
import { api, getErrorMessage } from '../lib/api';
import { fmtCurrency, fmtDate, fmtNumber } from '../lib/format';
import { GraphPoint } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';
import { AppTheme, useAppTheme } from '../theme';

const graphSections = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'thermometer-outline' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: 'water-outline' },
  { key: 'rgRatio', label: 'RG Ratio', unit: '', icon: 'color-filter-outline' },
  { key: 'mq137', label: 'MQ137', unit: '', icon: 'cloud-outline' },
  { key: 'tgs2620', label: 'TGS2620', unit: '', icon: 'analytics-outline' },
  { key: 'tgs822', label: 'TGS822', unit: '', icon: 'speedometer-outline' },
] as const;

export default function BatchDetailScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const route = useRoute<RouteProp<AppStackParamList, 'BatchDetail'>>();
  const navigation = useNavigation<any>();
  const factoryId = useAuthStore(state => state.factoryId);
  const { batchId } = route.params;
  const { summary, loading: summaryLoading, error: summaryError } = useBatchSummary(batchId);
  const { graphs, loading: graphsLoading, error: graphsError } = useBatchGraphs(batchId, 1_000);
  const { isLive, state: liveState, loading: liveLoading, refresh: refreshLive } =
    useFermentationState(factoryId, 1_000);
  const [updatingLiveState, setUpdatingLiveState] = useState(false);

  const live = isLive && liveState?.batchId === batchId;
  const status = live ? 'Live' : summary?.glp != null ? 'Completed' : 'Needs GLP';

  const showLiveDashboard = () => {
    navigation.navigate('Tabs', { screen: 'Dashboard' });
  };

  const startThisBatch = async () => {
    if (isLive) {
      showLiveDashboard();
      return;
    }

    setUpdatingLiveState(true);
    try {
      const now = new Date().toISOString();
      await api.post('/fermentation/control', {
        status: 'RUNNING',
        factory_id: factoryId,
        batch_id: batchId,
        device_id: liveState?.deviceId ?? 'DEV001',
      });
      publishFermentationState({
        factoryId,
        status: 'RUNNING',
        batchId,
        deviceId: liveState?.deviceId ?? 'DEV001',
        startedAt: now,
        updatedAt: now,
      });
      await refreshLive();
      showLiveDashboard();
    } catch (error) {
      await refreshLive();
      Alert.alert('Could not start fermentation', getErrorMessage(error));
    } finally {
      setUpdatingLiveState(false);
    }
  };

  const stopThisBatch = async () => {
    setUpdatingLiveState(true);
    try {
      await api.post('/fermentation/control', {
        status: 'STOPPED',
        factory_id: factoryId,
        batch_id: batchId,
        device_id: liveState?.deviceId,
      });
      publishFermentationState({
        factoryId,
        status: 'STOPPED',
        batchId: null,
        deviceId: liveState?.deviceId ?? null,
        startedAt: null,
        updatedAt: new Date().toISOString(),
      });
      await refreshLive();
    } catch (error) {
      Alert.alert('Could not stop live sensors', getErrorMessage(error));
    } finally {
      setUpdatingLiveState(false);
    }
  };

  const confirmStop = () => {
    Alert.alert(
      'Stop the live sensor stream?',
      `Batch ${batchId} will stop streaming on web and mobile.`,
      [
        { text: 'Keep running', style: 'cancel' },
        { text: 'Stop stream', style: 'destructive', onPress: stopThisBatch },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Batch intelligence</Text>
          <View style={styles.topSpacer} />
        </View>

        <View style={[styles.hero, live && styles.heroLive]}>
          <View style={styles.heroPattern} />
          <Badge label={status} variant={live ? 'live' : summary?.glp != null ? 'completed' : 'ongoing'} />
          <Text style={[styles.batchId, live && styles.batchIdLive]}>{batchId}</Text>
          <Text style={[styles.heroSubtitle, live && styles.heroSubtitleLive]}>
            {live
              ? `${liveState?.deviceId ?? 'Device'} is sending live telemetry`
              : 'Historical sensor and quality record'}
          </Text>

          <View style={styles.heroStats}>
            <HeroStat label="FACTORY" value={summary?.factoryId || factoryId} live={live} />
            <HeroStat
              label="GLP"
              value={summary?.glp != null ? `${summary.glp}%` : '—'}
              live={live}
            />
            <HeroStat
              label="PRICE"
              value={summary?.price != null ? fmtCurrency(summary.price) : '—'}
              live={live}
            />
          </View>
          <View style={styles.heroAction}>
            {live ? (
              <Button
                title="Stop live sensors"
                variant="secondary"
                loading={updatingLiveState}
                onPress={confirmStop}
              />
            ) : isLive ? (
              <Button
                title={`View ${liveState?.batchId ?? 'live batch'}`}
                onPress={showLiveDashboard}
              />
            ) : summary?.glp == null ? (
              <Button
                title="Start this batch"
                loading={updatingLiveState}
                disabled={liveLoading}
                onPress={startThisBatch}
              />
            ) : (
              <Button title="View live dashboard" variant="secondary" onPress={showLiveDashboard} />
            )}
          </View>
        </View>

        {summaryLoading ? <Loading label="Loading batch summary" /> : null}
        {summaryError ? (
          <View style={styles.infoStrip}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.warning} />
            <Text style={styles.infoText}>{summaryError}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>SIGNAL SHAPE</Text>
            <Text style={styles.sectionTitle}>Sensor history</Text>
          </View>
          <Text style={styles.sectionMeta}>{live ? 'LIVE · 1 SEC' : 'BATCH HISTORY'}</Text>
        </View>

        {graphsLoading ? <Loading label="Building signal history" /> : null}

        {graphSections.map((section, index) => {
          const points = graphs?.[section.key] ?? [];
          return (
            <Card key={section.key} style={[styles.graphCard, index === 1 && styles.graphFeatured]}>
              <View style={styles.graphTop}>
                <View style={[styles.graphIcon, index === 1 && styles.graphIconFeatured]}>
                  <Ionicons
                    name={section.icon}
                    size={18}
                    color={index === 1 ? '#031008' : theme.colors.primary}
                  />
                </View>
                <View style={styles.graphCopy}>
                  <Text style={[styles.graphLabel, index === 1 && styles.graphLabelFeatured]}>
                    {section.label}
                  </Text>
                  <Text style={[styles.graphLatest, index === 1 && styles.graphLatestFeatured]}>
                    {latestValue(points, section.unit)}
                  </Text>
                </View>
                <Text style={[styles.pointCount, index === 1 && styles.pointCountFeatured]}>
                  {points.length} PTS
                </Text>
              </View>
              <LineChart
                points={points}
                height={168}
                unit={section.unit}
                color={index === 1 ? theme.colors.ink : theme.colors.primaryDark}
              />
            </Card>
          );
        })}

        {graphsError ? (
          <View style={styles.errorStrip}>
            <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.errorText}>{graphsError}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>RECENT POINTS</Text>
            <Text style={styles.sectionTitle}>Temperature log</Text>
          </View>
        </View>

        {graphs?.temperature?.length ? (
          graphs.temperature.slice(-8).reverse().map((point, index) => (
            <View key={`${point.timestamp}-${index}`} style={styles.pointRow}>
              <View style={[styles.pointIndex, index === 0 && styles.pointIndexLatest]}>
                <Text style={[styles.pointIndexText, index === 0 && styles.pointIndexTextLatest]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.pointCopy}>
                <Text style={styles.pointTime}>{fmtDate(point.timestamp)}</Text>
                <Text style={styles.pointMeta}>{index === 0 ? 'Latest captured sample' : 'Historical sample'}</Text>
              </View>
              <Text style={styles.pointValue}>{fmtNumber(point.value, 1)}°C</Text>
            </View>
          ))
        ) : (
          <Card>
            <EmptyState title="No temperature history" message="Batch readings appear after the device begins reporting." />
          </Card>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({ label, value, live }: { label: string; value: string; live: boolean }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.heroStat}>
      <Text style={[styles.heroStatLabel, live && styles.heroStatLabelLive]}>{label}</Text>
      <Text style={[styles.heroStatValue, live && styles.heroStatValueLive]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function latestValue(points: GraphPoint[], unit: string) {
  if (!points.length) return 'No data';
  return `${fmtNumber(points[points.length - 1].value, unit ? 1 : 0)}${unit}`;
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900' },
  topSpacer: { width: 44 },
  hero: {
    minHeight: 260,
    borderRadius: 30,
    backgroundColor: '#F7FFF9',
    padding: 20,
    overflow: 'hidden',
  },
  heroLive: { backgroundColor: theme.colors.primary },
  heroPattern: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 32,
    borderColor: 'rgba(60,242,138,0.16)',
    right: -72,
    top: -80,
  },
  batchId: { color: '#031008', fontSize: 38, fontWeight: '900', letterSpacing: -1.4, marginTop: 28 },
  batchIdLive: { color: '#031008' },
  heroSubtitle: { color: '#4A5E51', fontSize: 11, fontWeight: '700', marginTop: 5 },
  heroSubtitleLive: { color: '#1D5A35' },
  heroStats: { flexDirection: 'row', marginTop: 28, gap: 8 },
  heroAction: { marginTop: 16 },
  heroStat: {
    flex: 1,
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(3,16,8,0.06)',
    padding: 10,
    justifyContent: 'space-between',
  },
  heroStatLabel: { color: '#5B6E61', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  heroStatLabelLive: { color: '#1D5A35' },
  heroStatValue: { color: '#031008', fontSize: 12, fontWeight: '900' },
  heroStatValueLive: { color: '#031008' },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.warningSoft,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
    padding: 13,
    marginTop: 12,
  },
  infoText: { color: theme.colors.warning, fontSize: 10, flex: 1, marginLeft: 9 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 13,
  },
  sectionKicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  sectionTitle: { color: theme.colors.text, fontSize: 21, fontWeight: '900', marginTop: 4 },
  sectionMeta: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  graphCard: { marginBottom: 10, borderRadius: 24 },
  graphFeatured: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  graphTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  graphIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphIconFeatured: { backgroundColor: 'rgba(255,255,255,0.24)' },
  graphCopy: { flex: 1, marginLeft: 11 },
  graphLabel: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.9, textTransform: 'uppercase' },
  graphLabelFeatured: { color: '#1D5A35' },
  graphLatest: { color: theme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 },
  graphLatestFeatured: { color: '#031008' },
  pointCount: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900' },
  pointCountFeatured: { color: '#1D5A35' },
  errorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    padding: 13,
  },
  errorText: { color: theme.colors.dangerText, fontSize: 10, flex: 1, marginLeft: 9 },
  pointRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pointIndex: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointIndexLatest: { backgroundColor: theme.colors.primary },
  pointIndexText: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '900' },
  pointIndexTextLatest: { color: '#031008' },
  pointCopy: { flex: 1, marginHorizontal: 11 },
  pointTime: { color: theme.colors.text, fontSize: 11, fontWeight: '900' },
  pointMeta: { color: theme.colors.textMuted, fontSize: 8, marginTop: 3 },
  pointValue: { color: theme.colors.primary, fontSize: 14, fontWeight: '900' },
  bottomSpace: { height: 28 },
});
