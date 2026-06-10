'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useFactoryBatches, useFactoryDashboard } from '@/hooks/useBatch';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { SkeletonBlock } from '@/components/ui/Spinner';
import { PageShell, DateRangeButton, FilterButton } from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';
import { fmtCurrency } from '@/lib/utils';
import type { FactorySummary } from '@/types';

export default function ManagerAnalyticsPage() {
  const factoryId = useAuthStore((s) => s.factoryId);
  const { dashboard, loading: dashLoading } = useFactoryDashboard(factoryId);
  const { batches, loading: batchesLoading } = useFactoryBatches(factoryId);
  const [summary, setSummary] = useState<FactorySummary | null>(null);
  const [sumLoading, setSumLoading] = useState(true);

  useEffect(() => {
    if (!factoryId) { setSumLoading(false); return; }
    api
      .get<{ data: FactorySummary }>(`/factories/${factoryId}/summary`)
      .then((r) => setSummary(r.data.data))
      .catch(() => {})
      .finally(() => setSumLoading(false));
  }, [factoryId]);

  const loading = dashLoading || batchesLoading || sumLoading;

  const pricedBatches = batches.filter((b) => b.price !== null);
  const priceChartData = pricedBatches.map((b, i) => ({
    idx: `#${i + 1}`,
    price: b.price ?? 0,
  }));

  const tiles: PerfTile[] = [
    {
      label: 'Total Batches',
      sub: 'All time',
      value: summary?.totalBatches ?? '—',
    },
    {
      label: 'Priced Batches',
      sub: 'Revenue generating',
      value: summary?.pricedBatches ?? '—',
      delta: summary?.totalBatches
        ? {
            value: `${Math.round(((summary.pricedBatches ?? 0) / summary.totalBatches) * 100)}%`,
            direction: 'up' as const,
            tone: 'positive' as const,
          }
        : undefined,
    },
    {
      label: 'Total Revenue',
      sub: `Top: ${summary?.topBatch?.batchId ?? '—'}`,
      value: fmtCurrency(summary?.totalRevenue),
      delta: { value: 'accumulated', direction: 'up' as const, tone: 'positive' as const },
    },
  ];

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/manager' },
        { label: 'Management' },
        { label: 'Analytics' },
      ]}
      title="Analytics"
      actions={
        <>
          <DateRangeButton>Last 90 days</DateRangeButton>
          <FilterButton />
        </>
      }
    >
      {loading ? (
        <>
          <SkeletonBlock className="h-40" />
          <div className="grid grid-cols-2 gap-5">
            <SkeletonBlock className="h-48" />
            <SkeletonBlock className="h-48" />
          </div>
          <SkeletonBlock className="h-80" />
        </>
      ) : (
        <>
          <PerfSummary
            title="Performance Summary"
            description={`Pricing analytics for factory ${factoryId}.`}
            tiles={tiles}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader title="Highest Price Batch" subtitle="All time peak" />
              <CardBody>
                {dashboard?.highestPriceBatch ? (
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-text-secondary">
                      {dashboard.highestPriceBatch.batchId}
                    </div>
                    <div className="font-display text-[32px] tabular text-accent-primary leading-none">
                      {fmtCurrency(dashboard.highestPriceBatch.price)}
                    </div>
                    {dashboard.highestPriceBatch.glp !== null && (
                      <div className="text-xs text-text-muted">
                        GLP: {dashboard.highestPriceBatch.glp}%
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Lowest Price Batch" subtitle="Underperformer" />
              <CardBody>
                {dashboard?.lowestPriceBatch ? (
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-text-secondary">
                      {dashboard.lowestPriceBatch.batchId}
                    </div>
                    <div className="font-display text-[32px] tabular text-accent-warn leading-none">
                      {fmtCurrency(dashboard.lowestPriceBatch.price)}
                    </div>
                    {dashboard.lowestPriceBatch.glp !== null && (
                      <div className="text-xs text-text-muted">
                        GLP: {dashboard.lowestPriceBatch.glp}%
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty />
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Price Variation" subtitle="Price across priced batches" />
            <CardBody>
              {priceChartData.length > 0 ? (
                <BarChart
                  data={priceChartData}
                  xKey="idx"
                  yKey="price"
                  color="var(--accent-primary)"
                  height={260}
                  yTickFormatter={(v) => `$${v}`}
                />
              ) : (
                <Empty />
              )}
            </CardBody>
          </Card>
        </>
      )}
    </PageShell>
  );
}

function Empty() {
  return (
    <div className="text-sm text-text-muted py-8 text-center">
      No priced batches yet — add prices to batches to unlock analytics.
    </div>
  );
}
