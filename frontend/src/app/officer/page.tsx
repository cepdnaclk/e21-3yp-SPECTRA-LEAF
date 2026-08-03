'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { api } from '@/lib/api';
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
import { PageShell } from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';
import { useFactoryBatches } from '@/hooks/useBatch';
import { useBatchReadings } from '@/hooks/useReadings';
import { useFermentationState } from '@/hooks/useFermentationState';
import type { BatchListItem } from '@/types';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'sensors',  label: 'Sensors'  },
  { key: 'batches',  label: 'Batches'  },
];

export default function OfficerDashboard() {
  const router = useRouter();
  const factoryId = useAuthStore((s) => s.factoryId);

  const { batches, loading: batchesLoading, reload: reloadBatches } = useFactoryBatches(
    factoryId, 5_000
  );
  const {
    state: fermentationState,
    isLive,
    loading: fermentationStateLoading,
    reload: reloadFermentationState,
  } = useFermentationState(factoryId, 1_000);

  const topBatches = useMemo(() => batches
    .filter((batch) => batch.price !== null && batch.price !== undefined)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, 6), [batches]);
  const highestPriceBatch = topBatches[0] ?? null;
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const scopedBatchId = isLive && fermentationState?.batchId
    ? fermentationState.batchId
    : selectedBatchId
      || fermentationState?.batchId
      || highestPriceBatch?.batchId
      || batches[0]?.batchId
      || null;
  const { readings, loading: readingsLoading } = useBatchReadings(scopedBatchId, 1_000);

  useEffect(() => {
    if (isLive && fermentationState?.batchId) {
      setSelectedBatchId(fermentationState.batchId);
    }
  }, [fermentationState?.batchId, isLive]);

  const [tab, setTab] = useState('overview');
  const [glpTarget, setGlpTarget] = useState<BatchListItem | null>(null);
  const [glpValue, setGlpValue] = useState(80);
  const [submitting, setSubmitting] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  // Start Fermentation modal state
  const [startOpen, setStartOpen] = useState(false);
  const [newBatchId, setNewBatchId] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('DEV001');
  const [starting, setStarting] = useState(false);
  const [startErr, setStartErr] = useState<string | null>(null);

  const latest = readings[readings.length - 1] ?? null;

  const tempTrend    = useMemo(() => readings.flatMap(r => r.temperature == null ? [] : [r.temperature]), [readings]);
  const humidityTrend= useMemo(() => readings.flatMap(r => r.humidity    == null ? [] : [r.humidity]), [readings]);
  const rgTrend      = useMemo(() => readings.flatMap(r => r.rgRatio     == null ? [] : [r.rgRatio]), [readings]);
  const mq137Trend   = useMemo(() => readings.flatMap(r => r.mq137       == null ? [] : [r.mq137]), [readings]);
  const tgs2620Trend = useMemo(() => readings.flatMap(r => r.tgs2620     == null ? [] : [r.tgs2620]), [readings]);
  const tgs822Trend  = useMemo(() => readings.flatMap(r => r.tgs822      == null ? [] : [r.tgs822]), [readings]);

  /* Time-series for the Sensors tab (oldest → newest) */
  const seriesData = useMemo(() => {
    return readings.map((r) => ({
        t: format(new Date(r.timestamp), 'HH:mm:ss'),
        temperature: r.temperature ?? null,
        humidity: r.humidity ?? null,
        rgRatio: r.rgRatio ?? null,
        mq137: r.mq137 ?? null,
        tgs2620: r.tgs2620 ?? null,
        tgs822: r.tgs822 ?? null,
      }));
  }, [readings]);

  const batchScopeLabel = scopedBatchId
    ? `${scopedBatchId} · ${readings.length} batch readings`
    : 'No batch selected';

  const totalRevenue = useMemo(
    () => topBatches.reduce((s, b) => s + (b.price ?? 0), 0),
    [topBatches]
  );

  const ongoing = isLive ? 1 : 0;
  const completed = batches.filter((b) => b.glp !== null && b.glp !== undefined).length;

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
      delta: latest
        ? { value: isLive ? 'live' : 'selected batch', direction: 'flat', tone: 'positive' }
        : undefined,
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

  const activeBatch = useMemo<BatchListItem | null>(() => {
    if (!isLive || !fermentationState?.batchId) return null;
    const existing = batches.find((batch) => batch.batchId === fermentationState.batchId);
    if (existing) {
      return latest?.batchId === existing.batchId ? {
        ...existing,
        lastTimestamp: latest.timestamp,
        latestTemperature: latest.temperature,
        latestHumidity: latest.humidity,
        latestRgRatio: latest.rgRatio,
        latestMq137: latest.mq137,
        latestTgs2620: latest.tgs2620,
        latestTgs822: latest.tgs822,
      } : existing;
    }

    return {
      batchId: fermentationState.batchId,
      lastTimestamp: fermentationState.startedAt,
      latestTemperature: null,
      latestHumidity: null,
      latestRgRatio: null,
      latestMq137: null,
      latestTgs2620: null,
      latestTgs822: null,
      glp: null,
      price: null,
    };
  }, [batches, fermentationState, isLive, latest]);

  function openStart() {
    if (isLive && activeBatch) {
      setStartErr(`Batch ${activeBatch.batchId} is still in fermentation. Set its GLP to mark it complete before starting another.`);
      setStartOpen(true);
      return;
    }
    const next = `BAT${String(batches.length + 1).padStart(3, '0')}`;
    setNewBatchId(next);
    setNewDeviceId('DEV001');
    setStartErr(null);
    setStartOpen(true);
  }

  async function handleStart() {
    if (isLive && activeBatch) {
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
      await api.post('/fermentation/control', {
        status: 'RUNNING',
        factory_id: factoryId,
        batch_id: newBatchId.trim().toUpperCase(),
        device_id: newDeviceId.trim().toUpperCase(),
      });

      setStartOpen(false);
      await Promise.all([reloadFermentationState(), reloadBatches()]);
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
      await api.post('/fermentation/control', {
        status: "STOPPED",
        factory_id: factoryId,
        batch_id: fermentationState?.batchId,
        device_id: fermentationState?.deviceId,
      });
      await Promise.all([reloadFermentationState(), reloadBatches()]);
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
      if (isLive && fermentationState?.batchId === glpTarget.batchId) {
        await api.post('/fermentation/control', {
          status: 'STOPPED',
          factory_id: factoryId,
          batch_id: fermentationState.batchId,
          device_id: fermentationState.deviceId,
        });
      }
      await api.put(`/batches/${glpTarget.batchId}/glp`, { factoryId, glp: glpValue });
      setGlpTarget(null);
      await Promise.all([reloadFermentationState(), reloadBatches()]);
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
          <Badge tone={isLive ? 'live' : 'neutral'}>
            {fermentationStateLoading ? 'Checking sensors…' : isLive ? 'Live' : 'Sensors stopped'}
          </Badge>
          {isLive ? (
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
          ) : (
            <Button
              onClick={openStart}
              disabled={fermentationStateLoading || starting}
              title="Start a new fermentation batch"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              {starting ? 'Starting...' : 'Start Fermentation'}
            </Button>
          )}
        </>
      }
    >
      <PerfSummary
        title="Performance Summary"
        description={isLive
          ? `Live signal from factory ${factoryId} — dashboards and graphs refresh every second.`
          : `Factory ${factoryId} sensors are currently stopped.`}
        tiles={tiles}
      />

      {/* ═════════════ OVERVIEW TAB ═════════════ */}
      {tab === 'overview' && <>

      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="eyebrow">Highest Priced Batch</div>
              {highestPriceBatch ? (
                <div className="flex items-end gap-3 mt-1">
                  <span className="font-mono text-[22px] font-bold text-text-primary">
                    {highestPriceBatch.batchId}
                  </span>
                  <span className="font-display text-[26px] text-accent-primary leading-none">
                    {fmtCurrency(highestPriceBatch.price ?? 0)}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-text-muted mt-1">No priced batches yet</div>
              )}
              <div className="text-[12px] text-text-muted mt-1">
                {isLive ? 'The running batch is locked for live monitoring.' : 'Choose which batch to inspect.'}
              </div>
            </div>
            <label className="min-w-[230px]">
              <span className="eyebrow block mb-2">Reading Batch</span>
              <select
                value={scopedBatchId ?? ''}
                onChange={(event) => setSelectedBatchId(event.target.value)}
                disabled={isLive || batches.length === 0}
                className="w-full h-10 rounded-md border border-border bg-elevated px-3 text-sm font-mono text-text-primary disabled:opacity-60"
              >
                {scopedBatchId && !batches.some((batch) => batch.batchId === scopedBatchId) ? (
                  <option value={scopedBatchId}>{scopedBatchId}</option>
                ) : null}
                {batches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId}>
                    {batch.batchId}{batch.price != null ? ` · ${fmtCurrency(batch.price)}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardBody>
      </Card>

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
                <Stat label="Humidity"
                      value={activeBatch.latestHumidity !== null
                        ? `${activeBatch.latestHumidity.toFixed(1)} %` : '—'} />
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
            <SensorCard label="Humidity" value={latest?.humidity ?? null} unit="%"
              trend={humidityTrend} color="#06b6d4" precision={1} />
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
            subtitle={`°C · ${batchScopeLabel}`}
            right={<Badge tone={isLive ? 'live' : 'neutral'}>{isLive ? 'Live batch' : 'Batch history'}</Badge>}
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
            title="Humidity over Time"
            subtitle={`% · ${batchScopeLabel}`}
            right={<Badge tone={isLive ? 'live' : 'neutral'}>{isLive ? 'Live batch' : 'Batch history'}</Badge>}
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
                series={[{ dataKey: 'humidity', name: 'Humidity', color: '#06b6d4' }]}
                height={240}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="RG Ratio over Time"
            subtitle={`Ratio · ${batchScopeLabel}`}
            right={<Badge tone={isLive ? 'live' : 'neutral'}>{isLive ? 'Live batch' : 'Batch history'}</Badge>}
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
            subtitle={batchScopeLabel}
            right={<Badge tone={isLive ? 'live' : 'neutral'}>{isLive ? 'Live batch' : 'Batch history'}</Badge>}
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
            subtitle={batchScopeLabel}
            right={<Badge tone={isLive ? 'live' : 'neutral'}>{isLive ? 'Live batch' : 'Batch history'}</Badge>}
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
            subtitle={batchScopeLabel}
            right={<Badge tone={isLive ? 'live' : 'neutral'}>{isLive ? 'Live batch' : 'Batch history'}</Badge>}
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
            subtitle={`${batchScopeLabel} · all sensors overlaid`}
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
                  { dataKey: 'humidity',    name: 'Humidity (%)',     color: '#06b6d4' },
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
                  <div className="mt-4 grid grid-cols-4 gap-3 pt-3 border-t border-border">
                    <MiniStat label="GLP" value={b.glp !== null && b.glp !== undefined ? `${b.glp}%` : '—'} />
                    <MiniStat label="Temp" value={b.latestTemperature != null ? `${b.latestTemperature.toFixed(1)}°` : '—'} />
                    <MiniStat label="Hum" value={b.latestHumidity != null ? `${b.latestHumidity.toFixed(1)}%` : '—'} />
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
