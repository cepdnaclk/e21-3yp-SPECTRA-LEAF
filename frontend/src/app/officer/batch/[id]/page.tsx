'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonBlock } from '@/components/ui/Spinner';
import { LineChart } from '@/components/charts/LineChart';
import { PageShell } from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';
import { useBatchSummary } from '@/hooks/useBatch';
import { useBatchGraphs } from '@/hooks/useReadings';
import { useFermentationState } from '@/hooks/useFermentationState';
import { fmtCurrency } from '@/lib/utils';

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const batchId = params?.id ?? null;
  const factoryId = useAuthStore((state) => state.factoryId);

  const { summary, loading: summaryLoading } = useBatchSummary(batchId);
  const { graphs, loading: graphsLoading, error: graphsError } = useBatchGraphs(batchId, 1_000);
  const {
    state: fermentationState,
    isLive,
    loading: liveLoading,
    reload: reloadFermentationState,
  } = useFermentationState(factoryId, 1_000);
  const [updatingLiveState, setUpdatingLiveState] = useState(false);
  const [liveActionError, setLiveActionError] = useState<string | null>(null);
  const isThisBatchLive = isLive && fermentationState?.batchId === batchId;

  async function startThisBatch() {
    if (!batchId || !factoryId || isLive) {
      router.push('/officer');
      return;
    }

    setUpdatingLiveState(true);
    setLiveActionError(null);
    try {
      await api.post('/fermentation/control', {
        status: 'RUNNING',
        factory_id: factoryId,
        batch_id: batchId,
        device_id: fermentationState?.deviceId ?? 'DEV001',
      });
      await reloadFermentationState();
      router.push('/officer');
    } catch (error: any) {
      setLiveActionError(
        error.response?.data?.message
        ?? error.response?.data?.error
        ?? 'Failed to start fermentation',
      );
      await reloadFermentationState();
    } finally {
      setUpdatingLiveState(false);
    }
  }

  async function stopThisBatch() {
    if (!factoryId || !isThisBatchLive) return;
    if (!window.confirm(`Stop live sensors for ${batchId}?`)) return;

    setUpdatingLiveState(true);
    setLiveActionError(null);
    try {
      await api.post('/fermentation/control', {
        status: 'STOPPED',
        factory_id: factoryId,
        batch_id: batchId,
        device_id: fermentationState?.deviceId,
      });
      await reloadFermentationState();
    } catch (error: any) {
      setLiveActionError(
        error.response?.data?.message
        ?? error.response?.data?.error
        ?? 'Failed to stop live sensors',
      );
    } finally {
      setUpdatingLiveState(false);
    }
  }

  const tempData = useMemo(
    () => (graphs?.temperature ?? []).map((p) => ({
      t: format(new Date(p.timestamp), 'HH:mm'),
      value: p.value,
    })),
    [graphs]
  );
  const humidityData = useMemo(
    () => (graphs?.humidity ?? []).map((p) => ({
      t: format(new Date(p.timestamp), 'HH:mm'),
      value: p.value,
    })),
    [graphs]
  );
  const rgData = useMemo(
    () => (graphs?.rgRatio ?? []).map((p) => ({
      t: format(new Date(p.timestamp), 'HH:mm'),
      value: p.value,
    })),
    [graphs]
  );
  const mq137Data = useMemo(
    () => (graphs?.mq137 ?? []).map((p) => ({
      t: format(new Date(p.timestamp), 'HH:mm'),
      value: p.value,
    })),
    [graphs]
  );
  const tgs2620Data = useMemo(
    () => (graphs?.tgs2620 ?? []).map((p) => ({
      t: format(new Date(p.timestamp), 'HH:mm'),
      value: p.value,
    })),
    [graphs]
  );
  const tgs822Data = useMemo(
    () => (graphs?.tgs822 ?? []).map((p) => ({
      t: format(new Date(p.timestamp), 'HH:mm'),
      value: p.value,
    })),
    [graphs]
  );

  const tiles: PerfTile[] = [
    {
      label: 'Batch ID',
      sub: 'Identifier',
      value: <span className="font-mono text-[22px]">{summary?.batchId ?? batchId ?? '—'}</span>,
    },
    {
      label: 'Factory',
      sub: 'Site',
      value: <span className="font-mono text-[22px]">{summary?.factoryId ?? '—'}</span>,
    },
    {
      label: 'GLP',
      sub: 'Good Leaf %',
      value: summary?.glp !== null && summary?.glp !== undefined ? `${summary.glp}%` : '—',
      delta: summary?.glp !== null && summary?.glp !== undefined
        ? { value: 'recorded', direction: 'up' as const, tone: 'positive' as const }
        : undefined,
    },
    {
      label: 'Batch Price',
      sub: 'Market value',
      value: fmtCurrency(summary?.price ?? undefined),
      delta: summary?.price
        ? { value: 'priced', direction: 'up' as const, tone: 'positive' as const }
        : undefined,
      accentColor: '#F59E0B',
    },
  ];

  if (summaryLoading || graphsLoading) {
    return (
      <PageShell
        breadcrumbs={[
          { label: 'Dashboard', href: '/officer' },
          { label: 'Batches', href: '/officer/history' },
          { label: batchId ?? '…' },
        ]}
        title={batchId ?? 'Loading…'}
      >
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-64" />
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/officer' },
        { label: 'Batches', href: '/officer/history' },
        { label: batchId ?? '—' },
      ]}
      title={batchId ?? '—'}
      actions={
        <>
          {isThisBatchLive ? (
            <Button variant="danger" size="sm" onClick={stopThisBatch} disabled={updatingLiveState}>
              {updatingLiveState ? 'Stopping…' : 'Stop Live Sensors'}
            </Button>
          ) : isLive ? (
            <Button size="sm" onClick={() => router.push('/officer')}>
              View {fermentationState?.batchId ?? 'Live Batch'}
            </Button>
          ) : summary?.glp == null ? (
            <Button size="sm" onClick={startThisBatch} disabled={liveLoading || updatingLiveState}>
              {updatingLiveState ? 'Starting…' : 'Start This Batch'}
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
        </>
      }
    >
      {liveActionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {liveActionError}
        </div>
      ) : null}
      <PerfSummary
        title="Batch Overview"
        description="Sensor readings and batch metadata. Graphs auto-refresh every second."
        tiles={tiles}
      />

      {graphsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {graphsError}. Retrying automatically…
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5">
        <Card>
          <CardHeader title="Temperature" subtitle="°C over time" />
          <CardBody>
            {tempData.length > 0 ? (
              <LineChart
                data={tempData}
                xKey="t"
                series={[{ dataKey: 'value', name: 'Temperature', color: 'var(--accent-primary)' }]}
                height={220}
              />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Humidity" subtitle="% over time" />
          <CardBody>
            {humidityData.length > 0 ? (
              <LineChart
                data={humidityData}
                xKey="t"
                series={[{ dataKey: 'value', name: 'Humidity', color: '#06b6d4' }]}
                height={220}
              />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="RG Ratio" subtitle="Ratio over time" />
          <CardBody>
            {rgData.length > 0 ? (
              <LineChart
                data={rgData}
                xKey="t"
                series={[{ dataKey: 'value', name: 'RG Ratio', color: 'var(--accent-warn)' }]}
                height={220}
              />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="MQ137 Reading" subtitle="Sensor reading over time" />
          <CardBody>
            {mq137Data.length > 0 ? (
              <LineChart
                data={mq137Data}
                xKey="t"
                series={[{ dataKey: 'value', name: 'MQ137', color: 'var(--accent-secondary)' }]}
                height={220}
              />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="TGS2620 Reading" subtitle="Sensor reading over time" />
          <CardBody>
            {tgs2620Data.length > 0 ? (
              <LineChart
                data={tgs2620Data}
                xKey="t"
                series={[{ dataKey: 'value', name: 'TGS2620', color: 'var(--accent-danger)' }]}
                height={220}
              />
            ) : <Empty />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="TGS822 Reading" subtitle="Sensor reading over time" />
          <CardBody>
            {tgs822Data.length > 0 ? (
              <LineChart
                data={tgs822Data}
                xKey="t"
                series={[{ dataKey: 'value', name: 'TGS822', color: 'var(--accent-primary)' }]}
                height={220}
              />
            ) : <Empty />}
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}

function Empty() {
  return (
    <div className="text-sm text-text-muted py-10 text-center">
      No sensor data recorded for this batch.
    </div>
  );
}
