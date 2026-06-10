import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Batch History</Text>
      <Text style={styles.muted}>All batches · Factory {factoryId}</Text>

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
          <Card style={{ marginBottom: theme.spacing.md }}>
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
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl * 2 },
  title: { fontSize: theme.font.h1, fontWeight: '800', color: theme.colors.text },
  muted: { color: theme.colors.textMuted, fontSize: theme.font.small },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  batchId: { fontSize: theme.font.body, fontWeight: '700', color: theme.colors.text },
  pill: {
    backgroundColor: '#eef4f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginTop: 4,
  },
  pillText: { color: theme.colors.primaryDark, fontSize: theme.font.tiny, fontWeight: '600' },
});
