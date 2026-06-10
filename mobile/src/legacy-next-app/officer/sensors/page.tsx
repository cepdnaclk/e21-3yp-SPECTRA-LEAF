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

  const tempTrend  = useMemo(() => readings.map(r => r.temperature ?? 0).reverse(), [readings]);
  const mqTrend    = useMemo(() => readings.map(r => r.mq135       ?? 0).reverse(), [readings]);
  const colorTrend = useMemo(() => readings.map(r => r.color       ?? 0).reverse(), [readings]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <>
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
              label="MQ135 Gas"
              value={latest?.mq135 ?? null}
              unit="ppm"
              trend={mqTrend}
              color="var(--accent-secondary)"
              precision={0}
            />
            <SensorCard
              label="Color Index"
              value={latest?.color ?? null}
              unit=""
              trend={colorTrend}
              color="var(--accent-warn)"
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
                <Th>Batch</Th>
                <Th>Temp °C</Th>
                <Th>MQ135 ppm</Th>
                <Th>Color</Th>
              </Thead>
              <tbody>
                {readings.map((r, i) => (
                  <Tr key={`${r.timestamp}-${r.deviceId}-${i}`}>
                    <Td className="font-mono text-[12px] text-text-secondary">
                      {format(new Date(r.timestamp), 'MMM dd HH:mm:ss')}
                    </Td>
                    <Td className="font-mono text-[12px]">{r.deviceId ?? '—'}</Td>
                    <Td className="font-mono text-[12px]">{r.batchId ?? '—'}</Td>
                    <Td className="tabular">{r.temperature?.toFixed(1) ?? '—'}</Td>
                    <Td className="tabular">{r.mq135?.toFixed(0) ?? '—'}</Td>
                    <Td className="tabular">{r.color?.toFixed(1) ?? '—'}</Td>
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
