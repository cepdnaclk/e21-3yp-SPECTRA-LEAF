import React, { useMemo, useState } from 'react';
import {
  Image,
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
import { useAuthStore } from '../store/authStore';
import { useFactoryBatches, useFactoryReadings } from '../hooks/useReadings';
import { useFermentationState } from '../hooks/useFermentationState';
import { fmtDate } from '../lib/format';
import { AppTheme, useAppTheme } from '../theme';

export default function FactoryScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const factoryId = useAuthStore(state => state.factoryId);
  const { readings, loading: readingsLoading, error: readingsError, refresh: refreshReadings } =
    useFactoryReadings(factoryId, 1_000, 60);
  const { batches, loading: batchesLoading, error: batchesError, refresh: refreshBatches } =
    useFactoryBatches(factoryId, 5_000);
  const { isLive, state: liveState, refresh: refreshLive } = useFermentationState(factoryId, 1_000);
  const [refreshing, setRefreshing] = useState(false);

  const devices = useMemo(() => {
    const latestByDevice = new Map<string, string>();
    readings.forEach(reading => {
      if (!reading.deviceId) return;
      const current = latestByDevice.get(reading.deviceId);
      if (!current || reading.timestamp > current) latestByDevice.set(reading.deviceId, reading.timestamp);
    });
    return Array.from(latestByDevice.entries()).map(([deviceId, lastSeen]) => ({
      deviceId,
      lastSeen,
      online: Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000,
    }));
  }, [readings]);

  const completed = batches.filter(batch => batch.glp != null).length;
  const error = readingsError || batchesError;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshReadings(), refreshBatches(), refreshLive()]);
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
            <Text style={styles.kicker}>FACILITY CONTROL</Text>
            <Text style={styles.title}>Factory floor</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="business-outline" size={22} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.factoryHero}>
          <View style={styles.factoryPatternOne} />
          <View style={styles.factoryPatternTwo} />
          <View style={styles.factoryHeroTop}>
            <View style={styles.factoryMark}>
              <Image source={require('../assets/images/Logo.png')} style={styles.factoryLogo} />
            </View>
            <Badge label={isLive ? 'Producing' : 'Ready'} variant={isLive ? 'live' : 'priced'} />
          </View>
          <Text style={styles.factoryCode}>{factoryId}</Text>
          <Text style={styles.factoryName}>Fermentation operations</Text>
          <View style={styles.factoryStats}>
            <HeroStat label="DEVICES" value={devices.length} />
            <HeroStat label="BATCHES" value={batches.length} />
            <HeroStat label="COMPLETED" value={completed} />
          </View>
        </View>

        {error ? (
          <Pressable onPress={onRefresh} style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>CURRENT OPERATION</Text>
            <Text style={styles.sectionTitle}>Floor status</Text>
          </View>
          <Text style={styles.sectionMeta}>LIVE SYNC</Text>
        </View>

        <Card style={styles.operationCard}>
          <View style={styles.operationIcon}>
            <Ionicons
              name={isLive ? 'radio-outline' : 'pause-outline'}
              size={21}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.operationCopy}>
            <Text style={styles.operationTitle}>
              {isLive ? `${liveState?.batchId ?? 'Batch'} is in chamber` : 'No active fermentation'}
            </Text>
            <Text style={styles.operationMeta}>
              {isLive
                ? `${liveState?.deviceId ?? 'Sensor'} · started ${fmtDate(liveState?.startedAt)}`
                : 'The chamber is available for the next officer cycle.'}
            </Text>
          </View>
          <View style={[styles.operationDot, isLive && styles.operationDotLive]} />
        </Card>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>CONNECTED HARDWARE</Text>
            <Text style={styles.sectionTitle}>Device roster</Text>
          </View>
          <Text style={styles.sectionMeta}>{devices.filter(device => device.online).length} ONLINE</Text>
        </View>

        {readingsLoading && devices.length === 0 ? <Loading label="Scanning device roster" /> : null}
        {!readingsLoading && devices.length === 0 ? (
          <Card>
            <EmptyState title="No devices reporting" message="A sensor appears after its first factory reading." />
          </Card>
        ) : null}

        {devices.map((device, index) => (
          <View key={device.deviceId} style={styles.deviceRow}>
            <View style={[styles.deviceNumber, device.online && styles.deviceNumberOnline]}>
              <Text style={[styles.deviceNumberText, device.online && styles.deviceNumberTextOnline]}>
                0{index + 1}
              </Text>
            </View>
            <View style={styles.deviceCopy}>
              <Text style={styles.deviceId}>{device.deviceId}</Text>
              <Text style={styles.deviceMeta}>Last seen {fmtDate(device.lastSeen)}</Text>
            </View>
            <View style={styles.deviceStatus}>
              <View style={[styles.statusDot, device.online && styles.statusDotOnline]} />
              <Text style={[styles.statusText, device.online && styles.statusTextOnline]}>
                {device.online ? 'ONLINE' : 'IDLE'}
              </Text>
            </View>
          </View>
        ))}

        {batchesLoading && batches.length === 0 ? <Loading /> : null}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
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
  factoryHero: {
    minHeight: 260,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    padding: 20,
    overflow: 'hidden',
  },
  factoryPatternOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 28,
    borderColor: 'rgba(3,16,8,0.08)',
    right: -55,
    top: -68,
  },
  factoryPatternTwo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'rgba(3,16,8,0.15)',
    right: 30,
    top: 23,
  },
  factoryHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  factoryMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factoryLogo: { width: 27, height: 27, resizeMode: 'contain' },
  factoryCode: { color: '#031008', fontSize: 39, fontWeight: '900', letterSpacing: -1.5, marginTop: 24 },
  factoryName: { color: '#1D5A35', fontSize: 12, fontWeight: '800', marginTop: 3 },
  factoryStats: { flexDirection: 'row', marginTop: 24 },
  heroStat: { flex: 1 },
  heroStatValue: { color: '#031008', fontSize: 20, fontWeight: '900' },
  heroStatLabel: { color: '#1D5A35', fontSize: 7, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
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
    marginBottom: 13,
  },
  sectionKicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  sectionTitle: { color: theme.colors.text, fontSize: 21, fontWeight: '900', marginTop: 4 },
  sectionMeta: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  operationCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 23 },
  operationIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationCopy: { flex: 1, marginHorizontal: 12 },
  operationTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900' },
  operationMeta: { color: theme.colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  operationDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: theme.colors.borderActive },
  operationDotLive: { backgroundColor: theme.colors.primary },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 13,
  },
  deviceNumber: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceNumberOnline: { backgroundColor: theme.colors.primarySoft },
  deviceNumberText: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900' },
  deviceNumberTextOnline: { color: theme.colors.primary },
  deviceCopy: { flex: 1, marginHorizontal: 11 },
  deviceId: { color: theme.colors.text, fontSize: 13, fontWeight: '900' },
  deviceMeta: { color: theme.colors.textMuted, fontSize: 9, marginTop: 3 },
  deviceStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.borderActive },
  statusDotOnline: { backgroundColor: theme.colors.primary },
  statusText: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  statusTextOnline: { color: theme.colors.primary },
  pressed: { opacity: 0.7 },
  bottomSpace: { height: 130 },
});
