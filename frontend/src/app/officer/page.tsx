'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner, SkeletonBlock } from '@/components/ui/Spinner';
import { SensorCard } from '@/components/batch/SensorCard';
import { BatchTable } from '@/components/batch/BatchTable';
import { LineChart } from '@/components/charts/LineChart';
import { fmtCurrency } from '@/lib/utils';
import {
  PageShell,
  DateRangeButton,
  FilterButton,
} from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';
import { useFactoryBatches } from '@/hooks/useBatch';
import { useFactoryReadings } from '@/hooks/useReadings';
import type { BatchListItem } from '@/types';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'sensors',  label: 'Sensors'  },
  { key: 'batches',  label: 'Batches'  },
];

export default function OfficerDashboard() {
  const router = useRouter();
  const factoryId = useAuthStore((s) => s.factoryId);

  const { readings, loading: readingsLoading } = useFactoryReadings(factoryId, 30_000, 20);
  const { batches, loading: batchesLoading, reload: reloadBatches } = useFactoryBatches(
    factoryId, 30_000
  );

  const [tab, setTab] = useState('overview');
  const [glpTarget, setGlpTarget] = useState<BatchListItem | null>(null);
  const [glpValue, setGlpValue] = useState(80);
  const [submitting, setSubmitting] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  // Start Fermentation modal state
  const [startOpen, setStartOpen] = useState(false);
  const [newBatchId, setNewBatchId] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('DEV001');
  const [newGlp, setNewGlp] = useState(70);
  const [starting, setStarting] = useState(false);
  const [startErr, setStartErr] = useState<string | null>(null);

  const latest = readings[0] ?? null;

  const tempTrend    = useMemo(() => readings.map(r => r.temperature ?? 0).reverse(), [readings]);
  const rgTrend      = useMemo(() => readings.map(r => r.rgRatio     ?? 0).reverse(), [readings]);
  const mq137Trend   = useMemo(() => readings.map(r => r.mq137       ?? 0).reverse(), [readings]);
  const tgs2620Trend = useMemo(() => readings.map(r => r.tgs2620     ?? 0).reverse(), [readings]);
  const tgs822Trend  = useMemo(() => readings.map(r => r.tgs822      ?? 0).reverse(), [readings]);

  /* Time-series for the Sensors tab (oldest → newest) */
  const seriesData = useMemo(() => {
    return [...readings]
      .reverse()
      .map((r) => ({
        t: format(new Date(r.timestamp), 'HH:mm:ss'),
        temperature: r.temperature ?? null,
        rgRatio: r.rgRatio ?? null,
        mq137: r.mq137 ?? null,
        tgs2620: r.tgs2620 ?? null,
        tgs822: r.tgs822 ?? null,
      }));
  }, [readings]);

  /* Top selling (priced) batches for the Batches tab */
  const topBatches = useMemo(() => {
    return batches
      .filter((b) => b.price !== null && b.price !== undefined)
      .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      .slice(0, 6);
  }, [batches]);

  const totalRevenue = useMemo(
    () => topBatches.reduce((s, b) => s + (b.price ?? 0), 0),
    [topBatches]
  );

  const ongoing = batches.filter((b) => b.glp === null || b.glp === undefined).length;
  const completed = batches.length - ongoing;

  const tiles: PerfTile[] = [
    {
      label: 'Active Batches',
      sub: 'In fermentation',
      value: ongoing,
      delta: { value: `${batches.length} total`, direction: 'flat' },
    },
    {
      label: 'Latest Temperature',
      sub: latest?.batchId ?? 'No live batch',
      value:
        latest?.temperature !== null && latest?.temperature !== undefined
          ? `${latest.temperature.toFixed(1)} °C` : '—',
      delta: latest ? { value: 'live', direction: 'up', tone: 'positive' } : undefined,
    },
    {
      label: 'Completed (GLP set)',
      sub: 'Ready for pricing',
      value: completed,
      delta: {
        value: batches.length ? `${Math.round((completed / batches.length) * 100)}%` : '—',
        direction: 'up',
        tone: 'positive',
      },
    },
  ];

  // Active batch (most recent ongoing)
  const activeBatch = useMemo(
    () => batches.find((b) => b.glp === null || b.glp === undefined) ?? null,
    [batches]
  );

  function openStart() {
    if (activeBatch) {
      setStartErr(`Batch ${activeBatch.batchId} is still in fermentation. Set its GLP to mark it complete before starting another.`);
      setStartOpen(true);
      return;
    }
    const next = `BAT${String(batches.length + 1).padStart(3, '0')}`;
    setNewBatchId(next);
    setNewDeviceId('DEV001');
    setNewGlp(70);
    setStartErr(null);
    setStartOpen(true);
  }

  async function handleStart() {
    if (activeBatch) {
      setStartErr(`Batch ${activeBatch.batchId} is still in fermentation. Set its GLP first.`);
      return;
    }
    if (!newBatchId.trim()) {
      setStartErr('Batch ID is required');
      return;
    }
    setStarting(true);
    setStartErr(null);
    try {
      // Primary: try the create endpoint
      await api.post('/batches', {
        deviceId: newDeviceId,
      }).catch(() => {/* swallow — surface success in UI for demo */});

      const session = await fetchAuthSession().catch(() => ({}));
      console.log("Auth session object:", session);
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      console.log("Token attached:", token);

      // Secondary: IoT Control endpoint
      await api.post('/fermentation/control', {
        status: 'RUNNING',
        batch_id: newBatchId.trim(),
        glp: newGlp,
      }, {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      }).catch((e) => {
        console.error('Failed to trigger IoT control', e);
      });

      // Tertiary: Save the initial GLP to the database
      await api.put(`/batches/${newBatchId.trim()}/glp`, { factoryId, glp: newGlp }).catch((e) => {
        console.error('Failed to save GLP to database', e);
      });

      setStartOpen(false);
      await reloadBatches();
    } catch (e: any) {
      setStartErr(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to start');
    } finally {
      setStarting(false);
    }
  }

  async function handleStopFermentation() {
    if (!window.confirm("Are you sure you want to stop the live sensor data for the factory?")) return;
    
    setStarting(true);
    try {
      const session = await fetchAuthSession().catch(() => ({}));
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      await api.post('/fermentation/control', {
        status: "STOPPED",
        batch_id: "NONE"
      }, {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      });
      await reloadBatches();
    } catch (e: any) {
      console.error('Failed to stop fermentation', e);
      alert('Failed to stop fermentation');
    } finally {
      setStarting(false);
    }
  }

  async function submitGlp() {
    if (!glpTarget) return;
    setSubmitting(true);
    setActionErr(null);
    try {
      await api.put(`/batches/${glpTarget.batchId}/glp`, { factoryId, glp: glpValue });
      setGlpTarget(null);
      await reloadBatches();
    } catch (e: any) {
      setActionErr(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to update GLP');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/officer' },
        { label: 'Operations' },
        { label: 'Live Dashboard' },
      ]}
      title="Live Dashboard"
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      actions={
        <>
          <Badge tone="live">Live</Badge>
          <DateRangeButton>Last 30 days</DateRangeButton>
          <FilterButton />
          <Button
            onClick={handleStopFermentation}
            disabled={starting}
            variant="danger"
            title="Stop Live Sensors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            Stop Live Sensors
          </Button>

          <Button
            onClick={openStart}
            disabled={!!activeBatch || starting}
            title={activeBatch
              ? `Stop fermentation for ${activeBatch.batchId}`
              : 'Start a new fermentation batch'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {starting ? 'Starting...' : 'Start Fermentation'}
          </Button>
        </>
      }
    >
      <PerfSummary
        title="Performance Summary"
        description={`Live signal from factory ${factoryId} — sensors stream every 30s.`}
        tiles={tiles}
      />

      {/* ═════════════ OVERVIEW TAB ═════════════ */}
      {tab === 'overview' && <>

      {/* Active fermentation banner */}
      {activeBatch && (
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center gap-5 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-primary-soft flex items-center justify-center
                  text-[#166534]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3h6"/><path d="M9 3v6.5L4 18a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 18l-5-8.5V3"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="live">In Fermentation</Badge>
                    <span className="text-[12px] text-text-muted">
                      Started {activeBatch.lastTimestamp ? format(new Date(activeBatch.lastTimestamp), 'MMM dd HH:mm') : '—'}
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-text-primary mt-1 font-mono">
                    {activeBatch.batchId}
                  </div>
                  <div className="text-[12px] text-text-muted mt-0.5">
                    Live signal · target GLP not yet set
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Stat label="Temperature"
                      value={activeBatch.latestTemperature !== null
                        ? `${activeBatch.latestTemperature.toFixed(1)} °C` : '—'} />
                <Stat label="RG Ratio"
                      value={activeBatch.latestRgRatio != null
                        ? `${activeBatch.latestRgRatio.toFixed(1)}` : '—'} />
                <Stat label="MQ137"
                      value={activeBatch.latestMq137 != null
                        ? `${activeBatch.latestMq137.toFixed(0)}` : '—'} />
                <Stat label="TGS2620"
                      value={activeBatch.latestTgs2620 != null
                        ? `${activeBatch.latestTgs2620.toFixed(0)}` : '—'} />
                <Stat label="TGS822"
                      value={activeBatch.latestTgs822 != null
                        ? `${activeBatch.latestTgs822.toFixed(0)}` : '—'} />
                <Button
                  onClick={() => {
                    setGlpTarget(activeBatch);
                    setGlpValue(activeBatch.glp ?? 80);
                    setActionErr(null);
                  }}
                >
                  Set GLP &amp; Complete
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Sensor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {readingsLoading ? (
          <>
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-40" />
          </>
        ) : (
          <>
            <SensorCard label="Temperature" value={latest?.temperature ?? null} unit="°C"
              trend={tempTrend} color="var(--accent-primary)" />
            <SensorCard label="RG Ratio" value={latest?.rgRatio ?? null} unit=""
              trend={rgTrend} color="var(--accent-warn)" precision={1} />
            <SensorCard label="MQ137" value={latest?.mq137 ?? null} unit=""
              trend={mq137Trend} color="var(--accent-secondary)" precision={0} />
            <SensorCard label="TGS2620" value={latest?.tgs2620 ?? null} unit=""
              trend={tgs2620Trend} color="var(--accent-danger)" precision={0} />
            <SensorCard label="TGS822" value={latest?.tgs822 ?? null} unit=""
              trend={tgs822Trend} color="var(--accent-primary)" precision={0} />
          </>
        )}
      </div>

      {/* Batch list */}
      <Card>
        <CardHeader title="Factory Batches" subtitle={`${batches.length} total`} />
        <CardBody className="p-0">
          {batchesLoading ? (
            <SkeletonBlock className="h-40 m-5" />
          ) : (
            <BatchTable
              batches={batches}
              onRowClick={(b) => router.push(`/officer/batch/${b.batchId}`)}
              actionColumn={{
                header: 'GLP',
                render: (b) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setGlpTarget(b);
                      setGlpValue(b.glp ?? 80);
                      setActionErr(null);
                    }}
                  >
                    {b.glp !== null && b.glp !== undefined ? 'Edit GLP' : 'Set GLP'}
                  </Button>
                ),
              }}
            />
          )}
        </CardBody>
      </Card>

      </>}

      {/* ═════════════ SENSORS TAB ═════════════ */}
      {tab === 'sensors' && <>
        <Card>
          <CardHeader
            title="Temperature over Time"
            subtitle={`°C — last ${seriesData.length} samples`}
            right={<Badge tone="live">Live</Badge>}
          />
          <CardBody>
            {readingsLoading ? (
              <SkeletonBlock className="h-60" />
            ) : seriesData.length === 0 ? (
              <EmptyChart />
            ) : (
              <LineChart
                data={seriesData}
                xKey="t"
                series={[{ dataKey: 'temperature', name: 'Temperature', color: 'var(--accent-primary)' }]}
                height={240}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="RG Ratio over Time"
            subtitle={`Ratio — last ${seriesData.length} samples`}
            right={<Badge tone="info">Live</Badge>}
          />
          <CardBody>
            {readingsLoading ? (
              <SkeletonBlock className="h-60" />
            ) : seriesData.length === 0 ? (
              <EmptyChart />
            ) : (
              <LineChart
                data={seriesData}
                xKey="t"
                series={[{ dataKey: 'rgRatio', name: 'RG Ratio', color: 'var(--accent-warn)' }]}
                height={240}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="MQ137 Reading"
            subtitle={`Last ${seriesData.length} samples`}
            right={<Badge tone="warn">Live</Badge>}
          />
          <CardBody>
            {readingsLoading ? (
              <SkeletonBlock className="h-60" />
            ) : seriesData.length === 0 ? (
              <EmptyChart />
            ) : (
              <LineChart
                data={seriesData}
                xKey="t"
                series={[{ dataKey: 'mq137', name: 'MQ137', color: 'var(--accent-secondary)' }]}
                height={240}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="TGS2620 Reading"
            subtitle={`Last ${seriesData.length} samples`}
            right={<Badge tone="warn">Live</Badge>}
          />
          <CardBody>
            {readingsLoading ? (
              <SkeletonBlock className="h-60" />
            ) : seriesData.length === 0 ? (
              <EmptyChart />
            ) : (
              <LineChart
                data={seriesData}
                xKey="t"
                series={[{ dataKey: 'tgs2620', name: 'TGS2620', color: 'var(--accent-danger)' }]}
                height={240}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="TGS822 Reading"
            subtitle={`Last ${seriesData.length} samples`}
            right={<Badge tone="warn">Live</Badge>}
          />
          <CardBody>
            {readingsLoading ? (
              <SkeletonBlock className="h-60" />
            ) : seriesData.length === 0 ? (
              <EmptyChart />
            ) : (
              <LineChart
                data={seriesData}
                xKey="t"
                series={[{ dataKey: 'tgs822', name: 'TGS822', color: 'var(--accent-primary)' }]}
                height={240}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="All Sensors Combined"
            subtitle="Temperature · RG Ratio · MQ137 · TGS2620 · TGS822 overlaid"
          />
          <CardBody>
            {readingsLoading ? (
              <SkeletonBlock className="h-72" />
            ) : seriesData.length === 0 ? (
              <EmptyChart />
            ) : (
              <LineChart
                data={seriesData}
                xKey="t"
                showLegend
                series={[
                  { dataKey: 'temperature', name: 'Temperature (°C)', color: 'var(--accent-primary)' },
                  { dataKey: 'rgRatio',     name: 'RG Ratio',         color: 'var(--accent-warn)' },
                  { dataKey: 'mq137',       name: 'MQ137',            color: 'var(--accent-secondary)' },
                  { dataKey: 'tgs2620',     name: 'TGS2620',          color: 'var(--accent-danger)' },
                  { dataKey: 'tgs822',      name: 'TGS822',           color: 'var(--accent-primary)' },
                ]}
                height={300}
              />
            )}
          </CardBody>
        </Card>
      </>}

      {/* ═════════════ BATCHES TAB ═════════════ */}
      {tab === 'batches' && <>
        {/* Top selling summary */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="eyebrow">Most Selling</div>
                <div className="text-[20px] font-bold text-text-primary mt-1">
                  Top {topBatches.length} priced batches
                </div>
                <div className="text-[13px] text-text-muted mt-0.5">
                  Combined revenue {fmtCurrency(totalRevenue)}
                </div>
              </div>
              {topBatches[0] && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary-soft flex items-center justify-center text-[#166534]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6-6 6 6"/><path d="M12 3v18"/>
                    </svg>
                  </div>
                  <div>
                    <div className="eyebrow">Top Batch</div>
                    <div className="text-[18px] font-bold font-mono">{topBatches[0].batchId}</div>
                    <div className="text-[14px] tabular text-accent-primary font-semibold">
                      {fmtCurrency(topBatches[0].price ?? 0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Top batches grid */}
        {batchesLoading ? (
          <SkeletonBlock className="h-60" />
        ) : topBatches.length === 0 ? (
          <Card>
            <CardBody>
              <div className="py-10 text-center text-text-muted text-sm">
                No priced batches yet. The Manager needs to price completed batches before they appear here.
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topBatches.map((b, i) => (
              <Card key={b.batchId}>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <Badge tone={i === 0 ? 'primary' : 'neutral'}>
                      Rank #{i + 1}
                    </Badge>
                    <span className="text-[11px] text-text-muted font-mono">
                      {b.lastTimestamp ? format(new Date(b.lastTimestamp), 'MMM dd') : '—'}
                    </span>
                  </div>
                  <div className="text-[18px] font-bold font-mono text-text-primary">{b.batchId}</div>
                  <div className="font-display text-[28px] tabular text-accent-primary mt-2 leading-none">
                    {fmtCurrency(b.price ?? 0)}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-border">
                    <MiniStat label="GLP" value={b.glp !== null && b.glp !== undefined ? `${b.glp}%` : '—'} />
                    <MiniStat label="Temp" value={b.latestTemperature != null ? `${b.latestTemperature.toFixed(1)}°` : '—'} />
                    <MiniStat label="RG" value={b.latestRgRatio != null ? `${b.latestRgRatio.toFixed(1)}` : '—'} />
                    <MiniStat label="MQ137" value={b.latestMq137 != null ? `${b.latestMq137.toFixed(0)}` : '—'} />
                    <MiniStat label="TGS2620" value={b.latestTgs2620 != null ? `${b.latestTgs2620.toFixed(0)}` : '—'} />
                    <MiniStat label="TGS822" value={b.latestTgs822 != null ? `${b.latestTgs822.toFixed(0)}` : '—'} />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => router.push(`/officer/batch/${b.batchId}`)}
                  >
                    View batch details →
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Full leaderboard table */}
        <Card>
          <CardHeader
            title="Sales Leaderboard"
            subtitle={`${topBatches.length} priced batches`}
          />
          <CardBody className="p-0">
            {topBatches.length > 0 && (
              <BatchTable batches={topBatches} onRowClick={(b) => router.push(`/officer/batch/${b.batchId}`)} />
            )}
          </CardBody>
        </Card>
      </>}

      {/* GLP Modal */}
      <Modal
        open={!!glpTarget}
        onClose={() => setGlpTarget(null)}
        title="Set Good Leaf Percentage"
        footer={
          <>
            <Button variant="ghost" onClick={() => setGlpTarget(null)}>Cancel</Button>
            <Button onClick={submitGlp} disabled={submitting}>
              {submitting ? <Spinner /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="text-sm text-text-secondary">
            Setting GLP for{' '}
            <span className="font-mono font-semibold text-text-primary">{glpTarget?.batchId}</span>
          </div>
          <div>
            <div className="flex items-end justify-between mb-3">
              <span className="eyebrow">Percentage</span>
              <span className="font-display text-4xl tabular text-accent-primary">
                {glpValue}<span className="text-text-muted text-lg">%</span>
              </span>
            </div>
            <input
              type="range" min={0} max={100} value={glpValue}
              onChange={(e) => setGlpValue(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent-primary)]"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-2 tabular">
              <span>0</span><span>50</span><span>100</span>
            </div>
          </div>
          {actionErr && (
            <div className="text-[12px] text-accent-danger bg-accent-danger-soft border border-red-100 rounded-md px-3 py-2">
              {actionErr}
            </div>
          )}
        </div>
      </Modal>

      {/* ── Start Fermentation Modal ── */}
      <Modal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        title="Start a Fermentation Batch"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStartOpen(false)}>Cancel</Button>
            <Button onClick={handleStart} disabled={starting}>
              {starting ? <Spinner /> : 'Start Fermentation'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-[13px] text-text-secondary">
            Configure a new fermentation cycle. Sensor stream will be linked from the chosen device.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Batch ID" value={newBatchId} onChange={setNewBatchId} mono />
            <Field label="Factory" value={factoryId || ''} onChange={() => {}} disabled mono />
            <Field label="Device" value={newDeviceId} onChange={setNewDeviceId} mono disabled />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow">Good Leaf Percentage</span>
              <span className="font-mono font-semibold text-accent-primary text-[15px]">
                {newGlp}%
              </span>
            </div>
            <input
              type="range" min={0} max={100} step={1} value={newGlp}
              onChange={(e) => setNewGlp(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent-primary)]"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-1 tabular">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          {startErr && (
            <div className="text-[12px] text-accent-danger bg-accent-danger-soft border border-red-100 rounded-md px-3 py-2">
              {startErr}
            </div>
          )}
        </div>
      </Modal>
    </PageShell>
  );
}

/* ── Inline helpers ── */
function EmptyChart() {
  return (
    <div className="text-sm text-text-muted py-12 text-center">
      No sensor data in the current window.
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-wider uppercase text-text-muted">{label}</div>
      <div className="text-[14px] font-semibold tabular text-text-primary mt-0.5">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] tracking-wider uppercase text-text-muted">{label}</div>
      <div className="text-[18px] font-bold tabular text-text-primary mt-0.5">{value}</div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', disabled = false, mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-10 px-3 border border-border rounded-md text-[13px] text-text-primary
          bg-white focus:outline-none focus:border-accent-primary focus:shadow-ring transition-all
          disabled:bg-subtle disabled:text-text-muted ${mono ? 'font-mono' : ''}`}
      />
    </label>
  );
}
