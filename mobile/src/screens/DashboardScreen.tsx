import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { useAuthStore } from '../store/authStore';
import { useFactoryBatches, useFactoryReadings } from '../hooks/useReadings';
import { api, getErrorMessage } from '../lib/api';
import { fmtCurrency, fmtDate, fmtNumber } from '../lib/format';
import { theme } from '../theme';
import { BatchListItem } from '../types';

type Tab = 'overview' | 'sensors' | 'batches';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'sensors',  label: 'Sensors'  },
  { key: 'batches',  label: 'Batches'  },
];

function fmt(n: number | null | undefined, digits = 1) {
  return fmtNumber(n, digits);
}

function isActiveBatch(b: BatchListItem) {
  return b.glp === null || b.glp === undefined;
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const factoryId  = useAuthStore(s => s.factoryId);
  const displayName = useAuthStore(s => s.displayName);

  const { readings, loading: readingsLoading, error: readingsError, refresh: refreshReadings } =
    useFactoryReadings(factoryId, 30000, 20);
  const { batches, loading: batchesLoading, error: batchesError, refresh: refreshBatches } =
    useFactoryBatches(factoryId, 30000);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [startOpen, setStartOpen]   = useState(false);
  const [glpOpen, setGlpOpen]       = useState(false);
  const [submitting, setSubmitting]  = useState(false);

  const [batchId, setBatchId]           = useState('');
  const [deviceId, setDeviceId]         = useState('DEV001');
  const [targetTemperature, setTargetTemperature] = useState('28.5');
  const [estimatedHours, setEstimatedHours]       = useState('8');
  const [glp, setGlp]                   = useState('80');

  const latest        = readings[0];
  const activeBatch   = useMemo(() => batches.find(isActiveBatch) || null, [batches]);
  const completedCount = batches.filter(b => !isActiveBatch(b)).length;
  const activeCount   = batches.filter(isActiveBatch).length;
  const deviceCount   = new Set(readings.map(r => r.deviceId).filter(Boolean)).size;
  const pricedBatches = useMemo(
    () => batches.filter(b => b.price != null).sort((a, b) => (b.price ?? 0) - (a.price ?? 0)),
    [batches]
  );
  const totalRevenue  = pricedBatches.reduce((s, b) => s + (b.price ?? 0), 0);

  const loading = readingsLoading && batchesLoading && readings.length === 0 && batches.length === 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshReadings(), refreshBatches()]);
    setRefreshing(false);
  };

  const submitStart = async () => {
    if (!batchId.trim()) { Alert.alert('Missing Batch ID', 'Enter a batch ID.'); return; }
    setSubmitting(true);
    try {
      await api.post('/batches/public', {
        deviceId: (deviceId.trim() || 'DEV001').toUpperCase(),
        factoryId,
        batchId: batchId.trim().toUpperCase(),
        targetTemperature: Number(targetTemperature) || 28.5,
        estimatedHours: Number(estimatedHours) || 8,
      });
      setStartOpen(false);
      setBatchId('');
      await refreshBatches();
      Alert.alert('Batch Registered', `Batch ${batchId.trim().toUpperCase()} is now active.`);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const submitGlp = async () => {
    if (!activeBatch) return;
    const v = Number(glp);
    if (Number.isNaN(v) || v < 0 || v > 100) {
      Alert.alert('Invalid GLP', 'GLP must be between 0 and 100.');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/batches/${activeBatch.batchId}/glp`, { factoryId, glp: v });
      setGlpOpen(false);
      await refreshBatches();
      Alert.alert('Updated', 'GLP set and batch completed.');
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Welcome back</Text>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.muted}>Factory {factoryId} · Officer</Text>
        </View>
        <Badge label="Live" variant="live" />
      </View>

      {loading ? <Loading /> : null}

      {/* ── Error banner ── */}
      {(readingsError || batchesError) && readings.length === 0 && batches.length === 0 ? (
        <Pressable onPress={onRefresh} style={styles.errorBanner}>
          <Ionicons name="cloud-offline-outline" size={20} color={theme.colors.danger} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text style={styles.errorTitle}>Could not reach server</Text>
            <Text style={styles.errorMsg}>{readingsError || batchesError}</Text>
          </View>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}

      {/* ── Live Dashboard label ── */}
      <Text style={styles.pageTitle}>Live Dashboard</Text>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <Pressable
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Performance summary tiles */}
          <View style={styles.tilesRow}>
            <PerfTile
              label="Active Batches"
              sub="In fermentation"
              value={activeCount}
              icon="flame"
              iconBg={theme.colors.warningSoft}
              iconFg={theme.colors.warning}
            />
            <PerfTile
              label="Latest Temp"
              sub={latest?.batchId || 'No live batch'}
              value={latest?.temperature != null ? `${fmt(latest.temperature)} °C` : '—'}
              icon="thermometer"
              iconBg={theme.colors.primarySoft}
              iconFg={theme.colors.primary}
              live={!!latest}
            />
            <PerfTile
              label="Completed"
              sub="GLP set"
              value={completedCount}
              icon="checkmark-circle"
              iconBg={theme.colors.accentSoft}
              iconFg={theme.colors.accent}
            />
          </View>

          {/* Active fermentation banner */}
          <Text style={styles.sectionTitle}>Active Fermentation</Text>
          {activeBatch ? (
            <Card style={styles.featureCard}>
              <View style={styles.rowBetween}>
                <View style={styles.batchIconWrap}>
                  <Ionicons name="leaf" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Badge label="In Fermentation" variant="ongoing" />
                  </View>
                  <Text style={[styles.batchId, { marginTop: 4 }]}>{activeBatch.batchId}</Text>
                  <Text style={styles.muted}>
                    Started {fmtDate(activeBatch.lastTimestamp)}
                  </Text>
                </View>
              </View>
              <View style={styles.batchStats}>
                <BatchStat label="Temperature"
                  value={activeBatch.latestTemperature != null ? `${fmt(activeBatch.latestTemperature)} °C` : '—'} />
                <BatchStat label="RG Ratio"
                  value={activeBatch.latestRgRatio != null ? fmt(activeBatch.latestRgRatio) : '—'} />
                <BatchStat label="MQ137"
                  value={activeBatch.latestMq137 != null ? fmt(activeBatch.latestMq137, 0) : '—'} />
                <BatchStat label="TGS2620"
                  value={activeBatch.latestTgs2620 != null ? fmt(activeBatch.latestTgs2620, 0) : '—'} />
                <BatchStat label="TGS822"
                  value={activeBatch.latestTgs822 != null ? fmt(activeBatch.latestTgs822, 0) : '—'} />
              </View>
              <Button
                title="Set GLP & Complete"
                onPress={() => setGlpOpen(true)}
                style={{ marginTop: theme.spacing.lg }}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                title="No active batch"
                message="Start a new fermentation batch to begin monitoring."
              />
              <Button title="Start Fermentation" onPress={() => setStartOpen(true)} />
            </Card>
          )}

          {/* Recent batches (short list) */}
          <Text style={styles.sectionTitle}>Factory Batches</Text>
          <Text style={styles.sectionSub}>{batches.length} total</Text>
          {batches.length === 0 ? (
            <Card>
              <EmptyState title="No batches yet" message="Batches will appear here once created." />
            </Card>
          ) : (
            batches.slice(0, 5).map(b => (
              <Pressable
                key={b.batchId}
                onPress={() => navigation.navigate('BatchDetail', { batchId: b.batchId })}
              >
                <Card style={styles.batchCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.batchId}>{b.batchId}</Text>
                      <Text style={styles.muted}>{fmtDate(b.lastTimestamp)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {isActiveBatch(b) ? (
                        <Badge label="Ongoing" variant="ongoing" />
                      ) : (
                        <Badge label="Completed" variant="completed" />
                      )}
                      {b.price != null ? <Badge label="Priced" variant="priced" /> : null}
                    </View>
                  </View>
                  <View style={[styles.row, { marginTop: theme.spacing.sm }]}>
                    <Pill label={`T ${fmt(b.latestTemperature)}°C`} />
                    <Pill label={`RG ${fmt(b.latestRgRatio)}`} />
                    <Pill label={`MQ137 ${fmt(b.latestMq137, 0)}`} />
                    <Pill label={`TGS2620 ${fmt(b.latestTgs2620, 0)}`} />
                    <Pill label={`TGS822 ${fmt(b.latestTgs822, 0)}`} />
                    {b.glp != null ? <Pill label={`GLP ${b.glp}%`} accent /> : null}
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </>
      )}

      {/* ══════════════ SENSORS TAB ══════════════ */}
      {activeTab === 'sensors' && (
        <>
          <SensorCard
            label="Temperature"
            value={latest?.temperature ?? null}
            unit="°C"
            icon="thermometer"
            color={theme.colors.primary}
            bg={theme.colors.primarySoft}
            deviceId={latest?.deviceId}
            timestamp={latest?.timestamp}
          />
          <SensorCard
            label="RG Ratio"
            value={latest?.rgRatio ?? null}
            unit=""
            icon="analytics"
            color={theme.colors.accent}
            bg={theme.colors.accentSoft}
            deviceId={latest?.deviceId}
            timestamp={latest?.timestamp}
          />
          <SensorCard
            label="MQ137"
            value={latest?.mq137 ?? null}
            unit=""
            icon="cloud"
            color={theme.colors.warning}
            bg={theme.colors.warningSoft}
            digits={0}
            deviceId={latest?.deviceId}
            timestamp={latest?.timestamp}
          />
          <SensorCard
            label="TGS2620"
            value={latest?.tgs2620 ?? null}
            unit=""
            icon="pulse"
            color={theme.colors.danger}
            bg={theme.colors.dangerSoft}
            digits={0}
            deviceId={latest?.deviceId}
            timestamp={latest?.timestamp}
          />
          <SensorCard
            label="TGS822"
            value={latest?.tgs822 ?? null}
            unit=""
            icon="radio"
            color={theme.colors.primary}
            bg={theme.colors.primarySoft}
            digits={0}
            deviceId={latest?.deviceId}
            timestamp={latest?.timestamp}
          />

          {/* Device / reading info */}
          <Card style={{ marginTop: theme.spacing.md }}>
            <Text style={styles.cardTitle}>Reading Details</Text>
            <View style={styles.detailGrid}>
              <DetailRow label="Device" value={latest?.deviceId || '—'} />
              <DetailRow label="Factory" value={factoryId} />
              <DetailRow label="Batch" value={latest?.batchId || '—'} />
              <DetailRow label="Timestamp" value={fmtDate(latest?.timestamp) || '—'} />
              <DetailRow label="Total Devices" value={String(deviceCount)} />
              <DetailRow label="Samples" value={String(readings.length)} />
            </View>
          </Card>

          {/* Mini trend: last N readings as text list */}
          {readings.length > 1 && (
            <Card style={{ marginTop: theme.spacing.md }}>
              <Text style={styles.cardTitle}>Recent Readings</Text>
              {readings.slice(0, 8).map((r, i) => (
                <View key={i} style={[styles.readingRow, i > 0 && styles.readingRowBorder]}>
                  <Text style={styles.readingTime}>{fmtDate(r.timestamp)}</Text>
                  <View style={styles.readingPills}>
                    <Pill label={`${fmt(r.temperature)}°C`} />
                    <Pill label={`RG ${fmt(r.rgRatio)}`} />
                    <Pill label={`MQ137 ${fmt(r.mq137, 0)}`} />
                    <Pill label={`TGS2620 ${fmt(r.tgs2620, 0)}`} />
                    <Pill label={`TGS822 ${fmt(r.tgs822, 0)}`} />
                  </View>
                </View>
              ))}
            </Card>
          )}
        </>
      )}

      {/* ══════════════ BATCHES TAB ══════════════ */}
      {activeTab === 'batches' && (
        <>
          {/* Top selling summary header */}
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>Most Selling</Text>
                <Text style={styles.cardTitle}>Top {pricedBatches.length} priced batches</Text>
                <Text style={styles.muted}>
                  Combined revenue {fmtCurrency(totalRevenue)}
                </Text>
              </View>
              {pricedBatches[0] && (
                <View style={styles.topBatchBadge}>
                  <View style={styles.topBatchIcon}>
                    <Ionicons name="trophy" size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.eyebrow}>Top Batch</Text>
                  <Text style={styles.topBatchId}>{pricedBatches[0].batchId}</Text>
                  <Text style={styles.topBatchPrice}>
                    {fmtCurrency(pricedBatches[0].price ?? 0)}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Priced batch cards */}
          {pricedBatches.length === 0 ? (
            <Card style={{ marginTop: theme.spacing.md }}>
              <EmptyState
                title="No priced batches"
                message="Completed batches need to be priced by the Manager before appearing here."
              />
            </Card>
          ) : (
            pricedBatches.slice(0, 6).map((b, i) => (
              <Pressable
                key={b.batchId}
                onPress={() => navigation.navigate('BatchDetail', { batchId: b.batchId })}
              >
                <Card style={styles.batchCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                      <Text style={styles.batchId}>{b.batchId}</Text>
                      <Text style={styles.priceText}>
                        {fmtCurrency(b.price ?? 0)}
                      </Text>
                    </View>
                    <Text style={styles.muted}>{fmtDate(b.lastTimestamp)?.split(' ')[0]}</Text>
                  </View>
                  <View style={[styles.miniStatRow, { marginTop: theme.spacing.md }]}>
                    <MiniStat label="GLP"  value={b.glp != null ? `${b.glp}%` : '—'} />
                    <MiniStat label="Temp" value={b.latestTemperature != null ? `${fmt(b.latestTemperature)}°` : '—'} />
                    <MiniStat label="RG"   value={b.latestRgRatio != null ? fmt(b.latestRgRatio) : '—'} />
                    <MiniStat label="MQ137" value={b.latestMq137 != null ? fmt(b.latestMq137, 0) : '—'} />
                    <MiniStat label="TGS2620" value={b.latestTgs2620 != null ? fmt(b.latestTgs2620, 0) : '—'} />
                    <MiniStat label="TGS822" value={b.latestTgs822 != null ? fmt(b.latestTgs822, 0) : '—'} />
                  </View>
                </Card>
              </Pressable>
            ))
          )}

          {/* Full batch list leaderboard */}
          <Text style={styles.sectionTitle}>All Batches</Text>
          <Text style={styles.sectionSub}>{batches.length} total</Text>
          {batches.length === 0 ? (
            <Card>
              <EmptyState title="No batches yet" message="Batches will appear here once created." />
            </Card>
          ) : (
            batches.map(b => (
              <Pressable
                key={b.batchId}
                onPress={() => navigation.navigate('BatchDetail', { batchId: b.batchId })}
              >
                <Card style={styles.batchCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.batchId}>{b.batchId}</Text>
                      <Text style={styles.muted}>{fmtDate(b.lastTimestamp)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {isActiveBatch(b) ? (
                        <Badge label="Ongoing" variant="ongoing" />
                      ) : (
                        <Badge label="Done" variant="completed" />
                      )}
                      {b.price != null ? <Badge label="Priced" variant="priced" /> : null}
                    </View>
                  </View>
                  <View style={[styles.row, { marginTop: theme.spacing.sm }]}>
                    <Pill label={`T ${fmt(b.latestTemperature)}°C`} />
                    <Pill label={`RG ${fmt(b.latestRgRatio)}`} />
                    <Pill label={`MQ137 ${fmt(b.latestMq137, 0)}`} />
                    <Pill label={`TGS2620 ${fmt(b.latestTgs2620, 0)}`} />
                    <Pill label={`TGS822 ${fmt(b.latestTgs822, 0)}`} />
                    {b.glp != null ? <Pill label={`GLP ${b.glp}%`} accent /> : null}
                    {b.price != null ? (
                      <Pill label={fmtCurrency(b.price)} accent />
                    ) : null}
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </>
      )}

      <View style={{ height: 100 }} />

      {/* ── Start Fermentation Modal ── */}
      <Modal visible={startOpen} animationType="slide" transparent onRequestClose={() => setStartOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Fermentation</Text>
              <Pressable onPress={() => setStartOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>
            <Text style={styles.label}>Batch ID</Text>
            <TextInput
              style={styles.input}
              value={batchId}
              onChangeText={setBatchId}
              placeholder="BAT001"
              autoCapitalize="characters"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.label}>Factory ID</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={factoryId} editable={false} />
            <Text style={styles.label}>Device ID</Text>
            <TextInput
              style={styles.input}
              value={deviceId}
              onChangeText={setDeviceId}
              placeholder="DEV001"
              autoCapitalize="characters"
              placeholderTextColor={theme.colors.textMuted}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Target Temp (°C)</Text>
                <TextInput
                  style={styles.input}
                  value={targetTemperature}
                  onChangeText={setTargetTemperature}
                  keyboardType="decimal-pad"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
              <View style={{ width: theme.spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Estimated Hours</Text>
                <TextInput
                  style={styles.input}
                  value={estimatedHours}
                  onChangeText={setEstimatedHours}
                  keyboardType="number-pad"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>
            <View style={{ height: theme.spacing.lg }} />
            <Button title="Start Batch" onPress={submitStart} loading={submitting} />
            <View style={{ height: theme.spacing.sm }} />
            <Button title="Cancel" variant="ghost" onPress={() => setStartOpen(false)} />
          </View>
        </View>
      </Modal>

      {/* ── GLP Modal ── */}
      <Modal visible={glpOpen} animationType="slide" transparent onRequestClose={() => setGlpOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set GLP & Complete</Text>
              <Pressable onPress={() => setGlpOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>
            <Text style={styles.muted}>Batch: {activeBatch?.batchId}</Text>
            <Text style={styles.label}>Good Leaf Percentage (0–100)</Text>
            <TextInput
              style={styles.input}
              value={glp}
              onChangeText={setGlp}
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textMuted}
            />
            <View style={{ height: theme.spacing.lg }} />
            <Button title="Submit GLP" onPress={submitGlp} loading={submitting} />
            <View style={{ height: theme.spacing.sm }} />
            <Button title="Cancel" variant="ghost" onPress={() => setGlpOpen(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────── Sub-components ─────────────────── */

function PerfTile({
  label, sub, value, icon, iconBg, iconFg, live,
}: {
  label: string; sub: string; value: string | number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string; iconFg: string; live?: boolean;
}) {
  return (
    <Card style={styles.perfTile}>
      <View style={[styles.perfTileIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconFg} />
      </View>
      <Text style={styles.perfTileValue}>{value}</Text>
      <Text style={styles.perfTileLabel}>{label}</Text>
      <View style={styles.perfTileSub}>
        {live && <View style={styles.liveDot} />}
        <Text style={styles.perfTileSubText} numberOfLines={1}>{sub}</Text>
      </View>
    </Card>
  );
}

function SensorCard({
  label, value, unit, icon, color, bg, digits = 1, deviceId, timestamp,
}: {
  label: string; value: number | null; unit: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string; bg: string; digits?: number;
  deviceId?: string; timestamp?: string;
}) {
  return (
    <Card style={styles.sensorCard}>
      <View style={styles.rowBetween}>
        <View style={[styles.sensorIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Badge label="Live" variant="live" />
      </View>
      <Text style={[styles.sensorValue, { color }]}>
        {value != null ? fmtNumber(value, digits) : '—'}
        {value != null && unit ? (
          <Text style={styles.sensorUnit}> {unit}</Text>
        ) : null}
      </Text>
      <Text style={styles.sensorLabel}>{label}</Text>
      {deviceId ? (
        <Text style={styles.sensorDevice}>{deviceId} · {fmtDate(timestamp) || '—'}</Text>
      ) : null}
    </Card>
  );
}

function BatchStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.batchStat}>
      <Text style={styles.batchStatLabel}>{label}</Text>
      <Text style={styles.batchStatValue}>{value}</Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Pill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.pill, accent && styles.pillAccent]}>
      <Text style={[styles.pillText, accent && styles.pillTextAccent]}>{label}</Text>
    </View>
  );
}

/* ─────────────────── Styles ─────────────────── */

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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  hello: { color: theme.colors.textMuted, fontSize: theme.font.small },
  name:  { color: theme.colors.text, fontSize: 22, fontWeight: '900' },
  muted: { color: theme.colors.textMuted, fontSize: theme.font.small, lineHeight: 19 },

  // Error banner
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.lg, padding: theme.spacing.md,
    marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: '#FECACA',
  },
  errorTitle: { fontSize: theme.font.small, fontWeight: '700', color: theme.colors.danger },
  errorMsg:   { fontSize: theme.font.tiny, color: theme.colors.danger, marginTop: 2 },
  retryText:  { fontSize: theme.font.small, fontWeight: '700', color: theme.colors.primary },

  // Page title + tabs
  pageTitle: {
    fontSize: 24, fontWeight: '900', color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.dark,
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tabLabel:       { fontSize: theme.font.small, fontWeight: '600', color: theme.colors.textMuted },
  tabLabelActive: { color: '#FFFFFF' },

  // Section headers
  sectionTitle: {
    fontSize: theme.font.h3, fontWeight: '700', color: theme.colors.text,
    marginTop: theme.spacing.xl, marginBottom: 2,
  },
  sectionSub: {
    fontSize: theme.font.small, color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },

  // Perf tiles (Overview)
  tilesRow: { flexDirection: 'row', gap: theme.spacing.sm },
  perfTile: { flex: 1, padding: theme.spacing.md, minWidth: 0 },
  perfTileIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  perfTileValue: {
    fontSize: 18, fontWeight: '800', color: theme.colors.text,
  },
  perfTileLabel: {
    fontSize: theme.font.tiny, color: theme.colors.textMuted,
    fontWeight: '600', marginTop: 2,
  },
  perfTileSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  perfTileSubText: { fontSize: theme.font.tiny, color: theme.colors.textMuted, flex: 1 },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },

  // Active batch card (Overview)
  featureCard: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
  },
  batchIconWrap: {
    width: 46, height: 46, borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  batchStats: {
    flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.lg,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  batchStat: { flexGrow: 1, flexBasis: '30%', alignItems: 'center' },
  batchStatLabel: { fontSize: theme.font.tiny, color: theme.colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  batchStatValue: { fontSize: theme.font.h3, fontWeight: '700', color: theme.colors.text, marginTop: 4 },

  // Sensor cards (Sensors tab)
  sensorCard: { marginBottom: theme.spacing.md },
  sensorIcon: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  sensorValue: { fontSize: 40, fontWeight: '800', marginTop: theme.spacing.md },
  sensorUnit:  { fontSize: 18, fontWeight: '600' },
  sensorLabel: { fontSize: theme.font.body, color: theme.colors.textMuted, fontWeight: '600', marginTop: 4 },
  sensorDevice:{ fontSize: theme.font.tiny, color: theme.colors.textMuted, marginTop: 4 },

  // Reading detail & history
  cardTitle: { fontSize: theme.font.h3, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md },
  detailGrid: { gap: theme.spacing.sm },
  detailRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel:{ fontSize: theme.font.small, color: theme.colors.textMuted, fontWeight: '600' },
  detailValue:{ fontSize: theme.font.small, color: theme.colors.text, fontWeight: '700' },
  readingRow: { paddingVertical: theme.spacing.sm },
  readingRowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  readingTime:{ fontSize: theme.font.tiny, color: theme.colors.textMuted, marginBottom: 4 },
  readingPills:{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 },

  // Batches tab
  eyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', color: theme.colors.textMuted,
    marginBottom: 4,
  },
  topBatchBadge: { alignItems: 'flex-end' },
  topBatchIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  topBatchId:   { fontSize: theme.font.body, fontWeight: '700', color: theme.colors.text },
  topBatchPrice:{ fontSize: theme.font.small, fontWeight: '700', color: theme.colors.primary },
  rankBadge: {
    minWidth: 32, height: 32, borderRadius: 8,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  rankText:   { fontSize: theme.font.small, fontWeight: '800', color: theme.colors.primaryDark },
  priceText:  { fontSize: theme.font.small, fontWeight: '700', color: theme.colors.primary, marginTop: 2 },
  miniStatRow:{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md, gap: theme.spacing.lg },
  miniStat:   {},
  miniStatLabel:{ fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textMuted },
  miniStatValue:{ fontSize: theme.font.small, fontWeight: '700', color: theme.colors.text, marginTop: 2 },

  // Shared
  batchCard: { marginBottom: theme.spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  batchId: { fontSize: theme.font.body, fontWeight: '700', color: theme.colors.text },
  pill: {
    backgroundColor: theme.colors.chip,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, marginRight: 4, marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.75)',
  },
  pillAccent: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primaryBorder },
  pillText:       { fontSize: theme.font.tiny, fontWeight: '600', color: theme.colors.textMuted },
  pillTextAccent: { color: theme.colors.primaryDark },

  // Modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.38)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: { fontSize: theme.font.h3, fontWeight: '700', color: theme.colors.text },
  label: {
    color: theme.colors.textMuted, fontSize: theme.font.small,
    marginBottom: 4, marginTop: 8, fontWeight: '600',
  },
  input: {
    height: 48, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingHorizontal: 14,
    color: theme.colors.text, backgroundColor: theme.colors.surfaceSoft,
  },
  disabledInput: { backgroundColor: theme.colors.subtle, color: theme.colors.textMuted },
});
