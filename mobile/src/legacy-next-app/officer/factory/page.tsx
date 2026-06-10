'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useFactoryReadings } from '@/hooks/useReadings';
import { useFactoryBatches } from '@/hooks/useBatch';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonBlock } from '@/components/ui/Spinner';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { PageShell } from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';

export default function FactoryPage() {
  const factoryId = useAuthStore((s) => s.factoryId);
  const { readings, loading: rLoading } = useFactoryReadings(factoryId, 60_000, 50);
  const { batches, loading: bLoading } = useFactoryBatches(factoryId, 60_000);

  const devices = useMemo(() => {
    const map = new Map<string, { lastSeen: string; samples: number }>();
    readings.forEach((r) => {
      if (!r.deviceId) return;
      const cur = map.get(r.deviceId);
      if (!cur || new Date(r.timestamp) > new Date(cur.lastSeen)) {
        map.set(r.deviceId, { lastSeen: r.timestamp, samples: (cur?.samples ?? 0) + 1 });
      } else {
        map.set(r.deviceId, { ...cur, samples: cur.samples + 1 });
      }
    });
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [readings]);

  const ongoing = batches.filter((b) => b.glp === null || b.glp === undefined).length;
  const completed = batches.length - ongoing;

  const tiles: PerfTile[] = [
    {
      label: 'Factory ID',
      sub: 'Site identifier',
      value: <span className="font-mono text-[24px]">{factoryId || '—'}</span>,
    },
    {
      label: 'Connected Devices',
      sub: 'Active sensors',
      value: devices.length,
      delta: { value: 'streaming', direction: 'up', tone: 'positive' },
    },
    {
      label: 'Total Batches',
      sub: `${ongoing} ongoing · ${completed} done`,
      value: batches.length,
    },
  ];

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/officer' },
        { label: 'Operations' },
        { label: 'Factory' },
      ]}
      title={`Factory ${factoryId}`}
    >
      <PerfSummary
        title="Factory Overview"
        description="Site metadata, devices, and recent activity."
        tiles={tiles}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Site info */}
        <Card>
          <CardHeader title="Site Information" subtitle="Static metadata" />
          <CardBody>
            <dl className="space-y-3 text-[13.5px]">
              {[
                ['Factory ID', factoryId || '—', true],
                ['Name', `${factoryId} — Highlands Mill`, false],
                ['Region', 'Nuwara Eliya, LK', false],
                ['Capacity', '4,200 kg / day', false],
                ['Operating Hours', '06:00 — 22:00 IST', false],
                ['Established', '2018', false],
              ].map(([k, v, mono]) => (
                <div key={k as string} className="flex justify-between gap-4 py-1.5 border-b border-border last:border-b-0">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className={`text-text-primary ${mono ? 'font-mono font-semibold' : ''}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader
            title="Connected Devices"
            subtitle={`${devices.length} active`}
            right={<Badge tone="live">Live</Badge>}
          />
          <CardBody className="p-0">
            {rLoading ? (
              <SkeletonBlock className="h-40 m-5" />
            ) : devices.length === 0 ? (
              <div className="text-sm text-text-muted py-8 text-center">
                No devices reporting yet.
              </div>
            ) : (
              <Table>
                <Thead>
                  <Th>Device ID</Th>
                  <Th>Last Seen</Th>
                  <Th>Samples</Th>
                  <Th>Status</Th>
                </Thead>
                <tbody>
                  {devices.map((d) => (
                    <Tr key={d.id}>
                      <Td className="font-mono">{d.id}</Td>
                      <Td className="text-text-secondary">
                        {new Date(d.lastSeen).toLocaleString()}
                      </Td>
                      <Td className="tabular">{d.samples}</Td>
                      <Td><Badge tone="primary">Online</Badge></Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent batches */}
      <Card>
        <CardHeader title="Recent Batch Activity" subtitle={`${batches.length} batches on this floor`} />
        <CardBody className="p-0">
          {bLoading ? (
            <SkeletonBlock className="h-40 m-5" />
          ) : batches.length === 0 ? (
            <div className="text-sm text-text-muted py-8 text-center">No batches yet.</div>
          ) : (
            <Table>
              <Thead>
                <Th>Batch ID</Th>
                <Th>Last Seen</Th>
                <Th>Temperature</Th>
                <Th>GLP</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {batches.slice(0, 8).map((b) => {
                  const done = b.glp !== null && b.glp !== undefined;
                  return (
                    <Tr key={b.batchId}>
                      <Td className="font-mono font-semibold">{b.batchId}</Td>
                      <Td className="text-text-secondary text-[12px]">
                        {b.lastTimestamp ? new Date(b.lastTimestamp).toLocaleString() : '—'}
                      </Td>
                      <Td className="tabular">
                        {b.latestTemperature !== null ? `${b.latestTemperature.toFixed(1)} °C` : '—'}
                      </Td>
                      <Td className="tabular">{done ? `${b.glp}%` : '—'}</Td>
                      <Td>
                        {done ? <Badge tone="info">Completed</Badge> : <Badge tone="primary">Ongoing</Badge>}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </PageShell>
  );
}
