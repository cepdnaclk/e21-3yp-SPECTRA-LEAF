import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import BrandMark from '../components/BrandMark';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { useFactoryBatches, useFactoryReadings } from '../hooks/useReadings';
import { useFermentationState } from '../hooks/useFermentationState';
import { api, getErrorMessage } from '../lib/api';
import { fmtDate, fmtNumber } from '../lib/format';
import { BatchListItem } from '../types';
import { AppTheme, useAppTheme } from '../theme';

const sensorTiles = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'thermometer-outline' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: 'water-outline' },
  { key: 'rgRatio', label: 'RG Ratio', unit: '', icon: 'color-filter-outline' },
  { key: 'mq137', label: 'MQ137', unit: '', icon: 'cloud-outline' },
  { key: 'tgs2620', label: 'TGS2620', unit: '', icon: 'analytics-outline' },
  { key: 'tgs822', label: 'TGS822', unit: '', icon: 'speedometer-outline' },
] as const;

function formatSensor(value: number | null | undefined, digits = 1) {
  return value == null ? '—' : fmtNumber(value, digits);
}

export default function DashboardScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();
  const factoryId = useAuthStore(state => state.factoryId);
  const displayName = useAuthStore(state => state.displayName);
  const { readings, loading: readingsLoading, error: readingsError, refresh: refreshReadings } =
    useFactoryReadings(factoryId, 15_000, 24);
  const { batches, loading: batchesLoading, error: batchesError, refresh: refreshBatches } =
    useFactoryBatches(factoryId, 15_000);
  const {
    state: liveState,
    isLive,
    loading: liveLoading,
    error: liveError,
    refresh: refreshLiveState,
  } = useFermentationState(factoryId, 5_000);

  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [glpOpen, setGlpOpen] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [deviceId, setDeviceId] = useState('DEV001');
  const [glp, setGlp] = useState('80');
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLive) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [isLive, pulse]);

  const latest = readings[0];
  const activeBatch = useMemo<BatchListItem | null>(() => {
    if (!isLive || !liveState?.batchId) return null;
    return batches.find(batch => batch.batchId === liveState.batchId) ?? {
      batchId: liveState.batchId,
      lastTimestamp: liveState.startedAt ?? '',
      latestTemperature: null,
      latestHumidity: null,
      latestRgRatio: null,
      latestMq137: null,
      latestTgs2620: null,
      latestTgs822: null,
      glp: null,
      price: null,
    };
  }, [batches, isLive, liveState]);

  const awaitingGlp = batches.filter(batch => batch.glp == null).length;
  const completed = batches.filter(batch => batch.glp != null).length;
  const loading =
    (readingsLoading || batchesLoading || liveLoading)
    && readings.length === 0
    && batches.length === 0;

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([refreshReadings(), refreshBatches(), refreshLiveState()]);
    setRefreshing(false);
  };

  const openStart = () => {
    if (isLive) {
      Alert.alert('Fermentation already live', `${liveState?.batchId ?? 'A batch'} is still streaming.`);
      return;
    }
    setBatchId(`BAT${String(batches.length + 1).padStart(3, '0')}`);
    setDeviceId('DEV001');
    setStartOpen(true);
  };

  const startFermentation = async () => {
    if (!batchId.trim()) {
      Alert.alert('Batch ID required', 'Add a batch ID before starting the sensor stream.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/fermentation/control', {
        status: 'RUNNING',
        factory_id: factoryId,
        batch_id: batchId.trim().toUpperCase(),
        device_id: (deviceId.trim() || 'DEV001').toUpperCase(),
        glp: Number(glp) || 80,
      });
      setStartOpen(false);
      await Promise.all([refreshLiveState(), refreshBatches(), refreshReadings()]);
    } catch (error) {
      Alert.alert('Could not start', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const stopFermentation = async () => {
    setSubmitting(true);
    try {
      await api.post('/fermentation/control', {
        status: 'STOPPED',
        factory_id: factoryId,
        batch_id: liveState?.batchId,
        device_id: liveState?.deviceId,
      });
      await Promise.all([refreshLiveState(), refreshBatches()]);
    } catch (error) {
      Alert.alert('Could not stop', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmStop = () => {
    Alert.alert(
      'Stop the live sensor stream?',
      'The web dashboard and every connected mobile device will switch to the stopped state.',
      [
        { text: 'Keep running', style: 'cancel' },
        { text: 'Stop stream', style: 'destructive', onPress: stopFermentation },
      ],
    );
  };

  const completeBatch = async () => {
    if (!activeBatch) return;
    const value = Number(glp);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      Alert.alert('Invalid GLP', 'Enter a value from 0 to 100.');
      return;
    }
    setSubmitting(true);
    try {
      if (isLive) {
        await api.post('/fermentation/control', {
          status: 'STOPPED',
          factory_id: factoryId,
          batch_id: activeBatch.batchId,
          device_id: liveState?.deviceId,
        });
      }
      await api.put(`/batches/${activeBatch.batchId}/glp`, { factoryId, glp: value });
      setGlpOpen(false);
      await Promise.all([refreshLiveState(), refreshBatches()]);
    } catch (error) {
      Alert.alert('Could not complete batch', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const error = readingsError || batchesError || liveError;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <BrandMark compact />
          <View style={styles.topActions}>
            <ThemeToggle compact />
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={20} color={theme.colors.primaryDark} />
            </View>
          </View>
        </View>
        <View style={styles.welcome}>
          <Text style={styles.kicker}>OFFICER DESK · {factoryId}</Text>
          <Text style={styles.greeting}>Good shift, {displayName.split(' ')[0]}.</Text>
        </View>

        <LinearGradient
          colors={
            theme.mode === 'dark'
              ? isLive ? ['#0B2B19', '#07110B'] : ['#151B17', '#080B09']
              : isLive ? ['#C8F6DA', '#F3FFF7'] : ['#FFFFFF', '#EAF3EC']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroRingLarge} />
          <View style={styles.heroRingSmall} />
          <View style={styles.heroStatus}>
            <Badge
              label={liveLoading ? 'Checking' : isLive ? 'Streaming' : 'Standby'}
              variant={isLive ? 'live' : 'neutral'}
            />
            {isLive ? (
              <Animated.View
                style={[
                  styles.pulseHalo,
                  {
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] }),
                    transform: [{
                      scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.4] }),
                    }],
                  },
                ]}
              />
            ) : null}
          </View>

          <Text style={styles.heroTitle}>
            {isLive
              ? `${liveState?.batchId ?? 'Batch'} is\nbreathing.`
              : 'Ready for the\nnext batch.'}
          </Text>
          <Text style={styles.heroBody}>
            {isLive
              ? `Signals from ${liveState?.deviceId ?? 'the chamber'} are shared with web and mobile.`
              : 'Start once the leaves and chamber are ready. Every connected dashboard will update.'}
          </Text>

          <View style={styles.heroActionRow}>
            <Button
              title={isLive ? 'Stop live sensors' : 'Start fermentation'}
              variant={isLive ? 'secondary' : 'primary'}
              disabled={liveLoading}
              loading={submitting}
              onPress={isLive ? confirmStop : openStart}
              style={styles.heroButton}
            />
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaLabel}>LAST SIGNAL</Text>
              <Text style={styles.heroMetaValue}>{fmtDate(latest?.timestamp) || 'No signal'}</Text>
            </View>
          </View>
        </LinearGradient>

        {error ? (
          <Pressable onPress={refreshAll} style={styles.errorStrip}>
            <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        ) : null}

        {loading ? <Loading label="Syncing factory state" /> : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>SHIFT OVERVIEW</Text>
            <Text style={styles.sectionTitle}>What needs attention</Text>
          </View>
          <Text style={styles.sectionCount}>{batches.length} batches</Text>
        </View>

        <View style={styles.attentionRow}>
          <AttentionTile label="Live now" value={isLive ? '01' : '00'} active={isLive} />
          <AttentionTile label="Needs GLP" value={String(awaitingGlp).padStart(2, '0')} />
          <AttentionTile label="Completed" value={String(completed).padStart(2, '0')} />
        </View>

        {activeBatch ? (
          <Card style={styles.workflowCard}>
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cardEyebrow}>ACTIVE FERMENTATION</Text>
                <Text style={styles.activeBatchId}>{activeBatch.batchId}</Text>
              </View>
              <Badge label="Live" variant="live" />
            </View>
            <View style={styles.flow}>
              <FlowStep label="Started" done />
              <View style={styles.flowLine} />
              <FlowStep label="Streaming" done />
              <View style={styles.flowLineMuted} />
              <FlowStep label="Quality" />
            </View>
            <Text style={styles.workflowHint}>
              When the leaf is ready, stop the stream and record its Good Leaf Percentage.
            </Text>
            <Button title="Set GLP & complete batch" onPress={() => setGlpOpen(true)} />
          </Card>
        ) : (
          <Card style={styles.readyCard}>
            <View style={styles.readyIcon}>
              <Ionicons name="leaf-outline" size={23} color={theme.colors.primary} />
            </View>
            <View style={styles.readyCopy}>
              <Text style={styles.readyTitle}>Chamber is available</Text>
              <Text style={styles.readyText}>No sensor stream is running for this factory.</Text>
            </View>
            <Pressable onPress={openStart} style={styles.roundAction}>
              <Ionicons name="arrow-forward" size={20} color="#031008" />
            </Pressable>
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>LIVE SNAPSHOT</Text>
            <Text style={styles.sectionTitle}>Chamber pulse</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Sensors')}>
            <Text style={styles.textAction}>View stream</Text>
          </Pressable>
        </View>

        <View style={styles.sensorGrid}>
          {sensorTiles.map((sensor, index) => (
            <SensorTile
              key={sensor.key}
              label={sensor.label}
              value={latest?.[sensor.key] ?? null}
              unit={sensor.unit}
              icon={sensor.icon}
              live={isLive}
              index={index}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>RECENT WORK</Text>
            <Text style={styles.sectionTitle}>Batch handoff</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Batches')}>
            <Text style={styles.textAction}>See all</Text>
          </Pressable>
        </View>

        {batches.length === 0 ? (
          <Card><EmptyState title="No batch history yet" message="Your first fermentation will appear here." /></Card>
        ) : (
          batches.slice(0, 4).map(batch => (
            <Pressable
              key={batch.batchId}
              onPress={() => navigation.navigate('BatchDetail', { batchId: batch.batchId })}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <BatchRow batch={batch} live={liveState?.batchId === batch.batchId && isLive} />
            </Pressable>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomSheet visible={startOpen} title="Start a clean cycle" onClose={() => setStartOpen(false)}>
        <Text style={styles.sheetIntro}>
          Confirm the chamber device and batch label. All officer dashboards will switch to live.
        </Text>
        <Field label="BATCH ID" value={batchId} onChangeText={setBatchId} />
        <Field label="DEVICE ID" value={deviceId} onChangeText={setDeviceId} />
        <Button title="Start sensor stream" onPress={startFermentation} loading={submitting} />
      </BottomSheet>

      <BottomSheet visible={glpOpen} title="Complete quality handoff" onClose={() => setGlpOpen(false)}>
        <Text style={styles.sheetIntro}>
          Batch {activeBatch?.batchId}. Enter the measured Good Leaf Percentage from 0 to 100.
        </Text>
        <Field label="GOOD LEAF PERCENTAGE" value={glp} onChangeText={setGlp} numeric />
        <Button title="Stop stream & save GLP" onPress={completeBatch} loading={submitting} />
      </BottomSheet>
    </SafeAreaView>
  );
}

function AttentionTile({ label, value, active }: { label: string; value: string; active?: boolean }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={[styles.attentionTile, active && styles.attentionTileActive]}>
      <Text style={[styles.attentionValue, active && styles.attentionValueActive]}>{value}</Text>
      <Text style={[styles.attentionLabel, active && styles.attentionLabelActive]}>{label}</Text>
    </View>
  );
}

function FlowStep({ label, done }: { label: string; done?: boolean }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.flowStep}>
      <View style={[styles.flowDot, done && styles.flowDotDone]}>
        {done ? <Ionicons name="checkmark" size={11} color="#031008" /> : null}
      </View>
      <Text style={[styles.flowLabel, done && styles.flowLabelDone]}>{label}</Text>
    </View>
  );
}

function SensorTile({
  label,
  value,
  unit,
  icon,
  live,
  index,
}: {
  label: string;
  value: number | null;
  unit: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  live: boolean;
  index: number;
}) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={[styles.sensorTile, index === 0 && styles.sensorTileFeatured]}>
      <View style={styles.sensorTileTop}>
        <Ionicons name={icon} size={18} color={index === 0 ? '#031008' : theme.colors.primary} />
        <View style={[styles.sensorStatus, live && styles.sensorStatusLive]} />
      </View>
      <Text style={[styles.sensorNumber, index === 0 && styles.sensorNumberFeatured]}>
        {formatSensor(value, index > 2 ? 0 : 1)}
        {value != null && unit ? <Text style={styles.sensorUnit}> {unit}</Text> : null}
      </Text>
      <Text style={[styles.sensorLabel, index === 0 && styles.sensorLabelFeatured]}>{label}</Text>
    </View>
  );
}

function BatchRow({ batch, live }: { batch: BatchListItem; live: boolean }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const status = live ? 'Live' : batch.glp != null ? 'Completed' : 'Needs GLP';
  return (
    <Card style={styles.batchRow}>
      <View style={styles.batchGlyph}>
        <Ionicons name="leaf-outline" size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.batchCopy}>
        <Text style={styles.batchId}>{batch.batchId}</Text>
        <Text style={styles.batchMeta}>
          {fmtDate(batch.lastTimestamp)} · {formatSensor(batch.latestHumidity)}% RH
        </Text>
      </View>
      <View style={styles.batchEnd}>
        <Text style={[styles.batchStatus, live && styles.batchStatusLive]}>{status}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </View>
    </Card>
  );
}

function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  numeric,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
}) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={numeric ? 'none' : 'characters'}
        keyboardType={numeric ? 'number-pad' : 'default'}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 21,
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  welcome: { marginBottom: 19 },
  kicker: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  greeting: { color: theme.colors.text, fontSize: 21, fontWeight: '900', marginTop: 5 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    minHeight: 330,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    padding: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroRingLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(60,242,138,0.14)',
    right: -74,
    top: -82,
  },
  heroRingSmall: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    borderWidth: 18,
    borderColor: 'rgba(60,242,138,0.05)',
    right: 16,
    top: 24,
  },
  heroStatus: { position: 'absolute', left: 22, top: 22, flexDirection: 'row', alignItems: 'center' },
  pulseHalo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginLeft: 10,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 290,
  },
  heroActionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  heroButton: { flex: 1, height: 48 },
  heroMeta: { width: 102, marginLeft: 14 },
  heroMetaLabel: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  heroMetaValue: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 4 },
  errorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 18,
    padding: 12,
  },
  errorText: { color: theme.colors.dangerText, fontSize: 11, flex: 1, marginHorizontal: 9 },
  retry: { color: theme.colors.text, fontSize: 11, fontWeight: '900' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 14,
  },
  sectionKicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  sectionTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 },
  sectionCount: { color: theme.colors.textMuted, fontSize: 11, marginBottom: 3 },
  textAction: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', marginBottom: 4 },
  attentionRow: { flexDirection: 'row', gap: 8 },
  attentionTile: {
    flex: 1,
    minHeight: 90,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 13,
    justifyContent: 'space-between',
  },
  attentionTileActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  attentionValue: { color: theme.colors.text, fontSize: 25, fontWeight: '900' },
  attentionValueActive: { color: '#031008' },
  attentionLabel: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  attentionLabelActive: { color: '#174B2C' },
  workflowCard: { marginTop: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardEyebrow: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  activeBatchId: { color: theme.colors.text, fontSize: 25, fontWeight: '900', marginTop: 4 },
  flow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 22 },
  flowStep: { alignItems: 'center' },
  flowDot: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowDotDone: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  flowLabel: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 6 },
  flowLabelDone: { color: theme.colors.textSecondary },
  flowLine: { height: 1, flex: 1, backgroundColor: theme.colors.primary, marginTop: 12 },
  flowLineMuted: { height: 1, flex: 1, backgroundColor: theme.colors.border, marginTop: 12 },
  workflowHint: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 16 },
  readyCard: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  readyIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyCopy: { flex: 1, marginHorizontal: 13 },
  readyTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900' },
  readyText: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4 },
  roundAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sensorTile: {
    width: '48.5%',
    minHeight: 145,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    justifyContent: 'space-between',
  },
  sensorTileFeatured: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  sensorTileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sensorStatus: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.borderActive },
  sensorStatusLive: { backgroundColor: theme.colors.primaryLight },
  sensorNumber: { color: theme.colors.text, fontSize: 27, fontWeight: '900', letterSpacing: -0.8 },
  sensorNumberFeatured: { color: '#031008' },
  sensorUnit: { fontSize: 12, fontWeight: '700' },
  sensorLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  sensorLabelFeatured: { color: '#174B2C' },
  batchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9, borderRadius: 20 },
  batchGlyph: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchCopy: { flex: 1, marginHorizontal: 12 },
  batchId: { color: theme.colors.text, fontSize: 14, fontWeight: '900' },
  batchMeta: { color: theme.colors.textMuted, fontSize: 10, marginTop: 3 },
  batchEnd: { alignItems: 'flex-end', gap: 5 },
  batchStatus: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  batchStatusLive: { color: theme.colors.primary },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  bottomSpace: { height: 118 },
  backdrop: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    padding: 20,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 46,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderActive,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '900' },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIntro: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 12 },
  field: { marginBottom: 14 },
  fieldLabel: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    backgroundColor: theme.colors.elevated,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 15,
  },
});
