import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ScreenBackground from '../components/ScreenBackground';
import { useBatchGraphs, useBatchSummary } from '../hooks/useBatch';
import { fmtCurrency, fmtDate, fmtNumber } from '../lib/format';
import { theme } from '../theme';
import { GraphPoint } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

function fmt(n: number | null | undefined, d = 1) {
  return fmtNumber(n, d);
}

function MiniChart({ points, color }: { points: GraphPoint[]; color: string }) {
  if (!points || points.length === 0) {
    return <Text style={styles.muted}>No data</Text>;
  }
  const values = points.map(p => Number(p.value)).filter(v => !Number.isNaN(v));
  if (values.length === 0) return <Text style={styles.muted}>No data</Text>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (
    <View>
      <View style={styles.bars}>
        {values.slice(-30).map((v, i) => {
          const h = 6 + ((v - min) / range) * 50;
          return <View key={i} style={[styles.bar, { height: h, backgroundColor: color }]} />;
        })}
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>min {fmt(min)}</Text>
        <Text style={styles.muted}>max {fmt(max)}</Text>
        <Text style={styles.muted}>n={values.length}</Text>
      </View>
    </View>
  );
}

export default function BatchDetailScreen() {
  const route = useRoute<RouteProp<AppStackParamList, 'BatchDetail'>>();
  const navigation = useNavigation();
  const { batchId } = route.params;
  const { summary, loading: sLoading, error: sError } = useBatchSummary(batchId);
  const { graphs, loading: gLoading, error: gError } = useBatchGraphs(batchId);

  return (
    <ScreenBackground>
    <SafeAreaView style={styles.scroll} edges={['top']}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{batchId}</Text>
      </View>
      {sLoading ? <Loading /> : null}
      {sError ? (
        <Card style={{ borderColor: theme.colors.danger }}>
          <Text style={{ color: theme.colors.danger }}>{sError}</Text>
        </Card>
      ) : null}

      <View style={[styles.row, { marginTop: theme.spacing.md }]}>
        <MetricCard label="Factory" value={summary?.factoryId || '—'} accent={theme.colors.info} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard label="GLP" value={summary?.glp ?? '—'} unit="%" accent={theme.colors.primary} />
      </View>
      <View style={[styles.row, { marginTop: theme.spacing.md }]}>
        <MetricCard label="Price" value={fmtCurrency(summary?.price)} accent={theme.colors.warning} />
        <View style={{ width: theme.spacing.md }} />
        <MetricCard
          label="Status"
          value={summary?.glp != null ? 'Completed' : 'Ongoing'}
          accent={summary?.glp != null ? theme.colors.success : theme.colors.warning}
        />
      </View>

      <Text style={styles.section}>Temperature</Text>
      <Card>
        {gLoading ? <Loading /> : <MiniChart points={graphs?.temperature || []} color={theme.colors.primary} />}
      </Card>

      <Text style={styles.section}>RG Ratio</Text>
      <Card>
        {gLoading ? <Loading /> : <MiniChart points={graphs?.rgRatio || []} color={theme.colors.warning} />}
      </Card>

      <Text style={styles.section}>MQ137</Text>
      <Card>
        {gLoading ? <Loading /> : <MiniChart points={graphs?.mq137 || []} color={theme.colors.dark} />}
      </Card>

      <Text style={styles.section}>TGS2620</Text>
      <Card>
        {gLoading ? <Loading /> : <MiniChart points={graphs?.tgs2620 || []} color={theme.colors.dark} />}
      </Card>

      <Text style={styles.section}>TGS822</Text>
      <Card>
        {gLoading ? <Loading /> : <MiniChart points={graphs?.tgs822 || []} color={theme.colors.primary} />}
      </Card>

      <Text style={styles.section}>Recent Temperature Points</Text>
      {graphs?.temperature && graphs.temperature.length > 0 ? (
        graphs.temperature.slice(-10).reverse().map((p, i) => (
          <Card key={i} style={{ marginBottom: 6 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>{fmtDate(p.timestamp)}</Text>
              <Text style={styles.value}>{fmt(p.value)}°C</Text>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <EmptyState title="No temperature points" />
        </Card>
      )}

      {gError ? (
        <Card style={{ borderColor: theme.colors.danger, marginTop: theme.spacing.md }}>
          <Text style={{ color: theme.colors.danger }}>{gError}</Text>
        </Card>
      ) : null}

      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
    </SafeAreaView>
    </ScreenBackground>
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
  muted: { color: theme.colors.textMuted, fontSize: theme.font.small, lineHeight: 19 },
  section: {
    fontSize: theme.font.h3,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  row: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontWeight: '900', color: theme.colors.text },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 78,
    gap: 4,
    marginBottom: 12,
  },
  bar: {
    flex: 1,
    minWidth: 4,
    borderRadius: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
  },
  backText: {
    fontSize: theme.font.body,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
