'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { SkeletonBlock } from '@/components/ui/Spinner';
import {
  PageShell,
  DateRangeButton,
  FilterButton,
} from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';
import { fmtCurrency } from '@/lib/utils';
import type { GeneralSummary, FactorySummary } from '@/types';

export default function GMPage() {
  const factoryIds = useAuthStore((s) => s.factoryIds);
  const [summary, setSummary] = useState<GeneralSummary | null>(null);
  const [perFactory, setPerFactory] = useState<FactorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!factoryIds.length) {
      setLoading(false);
      return;
    }
    const idsParam = factoryIds.join(',');
    Promise.all([
      api.get<{ data: GeneralSummary }>(`/general/summary?ids=${idsParam}`),
      api.get<{ data: FactorySummary[] }>(`/general/factories?ids=${idsParam}`),
    ])
      .then(([summaryRes, factoryRes]) => {
        setSummary(summaryRes.data.data);
        setPerFactory(factoryRes.data.data);
      })
      .catch((e) => setErr(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [factoryIds]);

  const totalBatches = perFactory.reduce((s, f) => s + f.totalBatches, 0);

  const tiles: PerfTile[] = summary
    ? [
        {
          label: 'Total Factories',
          sub: 'Active sites',
          value: summary.totalFactories,
          delta: { value: 'multi-site', direction: 'flat' },
        },
        {
          label: 'Consolidated Revenue',
          sub: 'Across all factories',
          value: fmtCurrency(summary.totalRevenue),
          delta: { value: 'tracking', direction: 'up', tone: 'positive' },
        },
        {
          label: 'Top Batch',
          sub: summary.topBatch?.batchId ?? '—',
          value: fmtCurrency(summary.topBatch?.price ?? undefined),
          delta: summary.topFactory
            ? { value: summary.topFactory, direction: 'up', tone: 'positive' }
            : undefined,
        },
      ]
    : [];

  const revenueChartData = perFactory.map((f) => ({
    label: f.factoryId,
    revenue: f.totalRevenue,
  }));

  const pieData = summary
    ? Object.entries(summary.factoryContributionPercentages).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/gm' },
        { label: 'Executive' },
        { label: 'Factory Overview' },
      ]}
      title="Factory Overview"
      actions={
        <>
          <DateRangeButton>Last 12 months</DateRangeButton>
          <FilterButton />
        </>
      }
    >
      {loading ? (
        <>
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-80" />
        </>
      ) : err || !summary ? (
        <div className="text-accent-danger bg-accent-danger-soft border border-red-100 rounded-md px-3 py-2">
          {err ?? 'No data available. Make sure factory IDs are configured.'}
        </div>
      ) : (
        <>
          <PerfSummary
            title="Performance Summary"
            description={`${totalBatches} batches across ${summary.totalFactories} factories.`}
            tiles={tiles}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {perFactory.map((f) => (
              <Card key={f.factoryId}>
                <CardHeader title={`Factory ${f.factoryId}`} subtitle={`${f.totalBatches} batches`} />
                <CardBody className="space-y-4">
                  <div>
                    <div className="eyebrow">Total Revenue</div>
                    <div className="font-display text-3xl tabular text-text-primary mt-1">
                      {fmtCurrency(f.totalRevenue)}
                    </div>
                  </div>
                  <div className="text-xs text-text-muted">{f.pricedBatches} priced batches</div>
                  {f.topBatch && (
                    <div className="pt-3 border-t border-border space-y-1">
                      <div className="eyebrow">Top Batch</div>
                      <div className="font-mono text-xs text-text-secondary">{f.topBatch.batchId}</div>
                      <div className="text-sm tabular text-text-primary font-semibold">
                        {fmtCurrency(f.topBatch.price)}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title="Revenue Comparison" subtitle="Across all factories" />
            <CardBody>
              {revenueChartData.length > 0 ? (
                <BarChart
                  data={revenueChartData}
                  xKey="label"
                  yKey="revenue"
                  height={260}
                  alternateColor
                  yTickFormatter={(v) => `$${v}`}
                />
              ) : (
                <div className="text-text-muted text-sm py-6 text-center">No data</div>
              )}
            </CardBody>
          </Card>

          {pieData.length > 0 && (
            <Card>
              <CardHeader title="Revenue Distribution" subtitle="Factory contribution percentages" />
              <CardBody>
                <PieChart data={pieData} height={320} />
              </CardBody>
            </Card>
          )}
        </>
      )}
    </PageShell>
  );
}
