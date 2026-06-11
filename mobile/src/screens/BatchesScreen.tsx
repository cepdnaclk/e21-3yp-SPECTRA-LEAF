import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ScreenBackground from '../components/ScreenBackground';
import { useAuthStore } from '../store/authStore';
import { useFactoryBatches } from '../hooks/useReadings';
import { fmtCurrency, fmtDate, fmtNumber } from '../lib/format';
import { theme } from '../theme';
import { BatchListItem } from '../types';

function fmt(n: number | null | undefined, d = 1) {
  return fmtNumber(n, d);
}

const isActive = (b: BatchListItem) => b.glp === null || b.glp === undefined;

export default function BatchesScreen() {
  const navigation = useNavigation<any>();
  const factoryId = useAuthStore(s => s.factoryId);
  const { batches, loading, error, refresh } = useFactoryBatches(factoryId, 30000);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <ScreenBackground>
    <SafeAreaView style={styles.scroll} edges={['top']}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.title}>Batch History</Text>
        <Text style={styles.headerMuted}>All batches · Factory {factoryId}</Text>
      </View>

      {error ? (
        <Card style={{ marginTop: theme.spacing.md, borderColor: theme.colors.danger }}>
          <Text style={{ color: theme.colors.danger }}>{error}</Text>
        </Card>
      ) : null}

      <View style={{ height: theme.spacing.lg }} />

      {loading && batches.length === 0 ? <Loading /> : null}

      {!loading && batches.length === 0 ? (
        <Card>
          <EmptyState title="No batches" message="No batches found for this factory." />
        </Card>
      ) : null}

      {batches.map(b => (
        <Pressable
          key={b.batchId}
          onPress={() => navigation.navigate('BatchDetail', { batchId: b.batchId })}
        >
          <Card style={styles.batchCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.batchId}>{b.batchId}</Text>
                <Text style={styles.muted}>
                  {fmtDate(b.lastTimestamp)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {isActive(b) ? (
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
              {b.glp != null ? <Pill label={`GLP ${b.glp}%`} /> : null}
              {b.price != null ? <Pill label={fmtCurrency(b.price)} /> : null}
            </View>
          </Card>
        </Pressable>
      ))}

      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
    </SafeAreaView>
    </ScreenBackground>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
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
    borderRadius: 36,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 9,
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  batchCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  batchId: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: theme.colors.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillText: { color: theme.colors.textSecondary, fontSize: theme.font.tiny, fontWeight: '800' },
});
