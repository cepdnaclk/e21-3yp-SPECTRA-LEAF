'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';
import { useFactoryReadings } from '@/hooks/useReadings';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonBlock } from '@/components/ui/Spinner';
import { SensorCard } from '@/components/batch/SensorCard';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { PageShell, FilterButton } from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';

export default function SensorsPage() {
  const factoryId = useAuthStore((s) => s.factoryId);
  const { readings, loading } = useFactoryReadings(factoryId, 15_000, 30);

  const latest = readings[0] ?? null;

  const tempTrend    = useMemo(() => readings.map(r => r.temperature ?? 0).reverse(), [readings]);
  const humidityTrend= useMemo(() => readings.map(r => r.humidity    ?? 0).reverse(), [readings]);
  const rgTrend      = useMemo(() => readings.map(r => r.rgRatio     ?? 0).reverse(), [readings]);
  const mq137Trend   = useMemo(() => readings.map(r => r.mq137       ?? 0).reverse(), [readings]);
  const tgs2620Trend = useMemo(() => readings.map(r => r.tgs2620     ?? 0).reverse(), [readings]);
  const tgs822Trend  = useMemo(() => readings.map(r => r.tgs822      ?? 0).reverse(), [readings]);

  const devices = useMemo(() => {
    const set = new Set<string>();
    readings.forEach((r) => { if (r.deviceId) set.add(r.deviceId); });
    return Array.from(set);
  }, [readings]);

  const tiles: PerfTile[] = [
    {
      label: 'Active Devices',
      sub: 'Streaming sensors',
      value: devices.length,
      delta: { value: 'online', direction: 'up', tone: 'positive' },
    },
    {
      label: 'Stream Window',
      sub: 'Polling every 15s',
      value: `${readings.length}`,
      delta: { value: 'samples', direction: 'flat' },
    },
    {
      label: 'Last Reading',
      sub: latest?.batchId ?? 'No active batch',
      value: latest ? format(new Date(latest.timestamp), 'HH:mm:ss') : '—',
      delta: latest ? { value: 'fresh', direction: 'up', tone: 'positive' } : undefined,
    },
  ];

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/officer' },
        { label: 'Operations' },
        { label: 'Sensors' },
      ]}
      title="Sensor Stream"
      actions={
        <>
          <Badge tone="live">Live</Badge>
          <FilterButton />
        </>
      }
    >
      <PerfSummary
        title="Sensor Health"
        description={`Real-time stream from factory ${factoryId} — every 15 seconds.`}
        tiles={tiles}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {loading ? (
          <>
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
          </>
        ) : (
          <>
            <SensorCard
              label="Temperature"
              value={latest?.temperature ?? null}
              unit="°C"
              trend={tempTrend}
              color="var(--accent-primary)"
            />
            <SensorCard
              label="Humidity"
              value={latest?.humidity ?? null}
              unit="%"
              trend={humidityTrend}
              color="#06b6d4"
              precision={1}
            />
            <SensorCard
              label="RG Ratio"
              value={latest?.rgRatio ?? null}
              unit=""
              trend={rgTrend}
              color="var(--accent-warn)"
              precision={1}
            />
            <SensorCard
              label="MQ137 Reading"
              value={latest?.mq137 ?? null}
              unit=""
              trend={mq137Trend}
              color="var(--accent-secondary)"
              precision={0}
            />
            <SensorCard
              label="TGS2620 Reading"
              value={latest?.tgs2620 ?? null}
              unit=""
              trend={tgs2620Trend}
              color="var(--accent-danger)"
              precision={0}
            />
            <SensorCard
              label="TGS822 Reading"
              value={latest?.tgs822 ?? null}
              unit=""
              trend={tgs822Trend}
              color="var(--accent-primary)"
              precision={0}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader
          title="Recent Readings"
          subtitle={`${readings.length} samples · live feed`}
          right={
            <div className="flex items-center gap-2 text-[12px] text-text-muted">
              <span className="live-dot" />
              Auto-refreshing
            </div>
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <SkeletonBlock className="h-40 m-5" />
          ) : readings.length === 0 ? (
            <div className="text-sm text-text-muted py-10 text-center">No sensor data yet.</div>
          ) : (
            <Table>
              <Thead>
                <Th>Timestamp</Th>
                <Th>Device</Th>
                <Th>Factory</Th>
                <Th>Batch</Th>
                <Th>RG Ratio</Th>
                <Th>Temp °C</Th>
                <Th>Humidity %</Th>
                <Th>MQ137 Reading</Th>
                <Th>TGS2620 Reading</Th>
                <Th>TGS822 Reading</Th>
              </Thead>
              <tbody>
                {readings.map((r, i) => (
                  <Tr key={`${r.timestamp}-${r.deviceId}-${i}`}>
                    <Td className="font-mono text-[12px] text-text-secondary">
                      {format(new Date(r.timestamp), 'MMM dd HH:mm:ss')}
                    </Td>
                    <Td className="font-mono text-[12px]">{r.deviceId ?? '—'}</Td>
                    <Td className="font-mono text-[12px]">{r.factoryId ?? '—'}</Td>
                    <Td className="font-mono text-[12px]">{r.batchId ?? '—'}</Td>
                    <Td className="tabular">{r.rgRatio?.toFixed(1) ?? '—'}</Td>
                    <Td className="tabular">{r.temperature?.toFixed(1) ?? '—'}</Td>
                    <Td className="tabular">{r.humidity?.toFixed(1) ?? '—'}</Td>
                    <Td className="tabular">{r.mq137?.toFixed(0) ?? '—'}</Td>
                    <Td className="tabular">{r.tgs2620?.toFixed(0) ?? '—'}</Td>
                    <Td className="tabular">{r.tgs822?.toFixed(0) ?? '—'}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </PageShell>
  );
}
