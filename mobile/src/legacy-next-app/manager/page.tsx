'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useFactoryBatches } from '@/hooks/useBatch';
import { BatchTable } from '@/components/batch/BatchTable';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner, SkeletonBlock } from '@/components/ui/Spinner';
import {
  PageShell,
  DateRangeButton,
  FilterButton,
} from '@/components/layout/PageShell';
import { PerfSummary, PerfTile } from '@/components/layout/PerfSummary';
import { fmtCurrency } from '@/lib/utils';
import type { BatchListItem } from '@/types';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'priced', label: 'Priced' },
  { key: 'pending', label: 'Pending' },
];

export default function ManagerBatchesPage() {
  const factoryId = useAuthStore((s) => s.factoryId);
  const { batches, loading, reload } = useFactoryBatches(factoryId);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BatchListItem | null>(null);
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = batches;
    if (tab === 'priced') list = list.filter((b) => b.price !== null && b.price !== undefined);
    if (tab === 'pending') list = list.filter((b) => b.price === null || b.price === undefined);
    if (search) list = list.filter((b) => b.batchId.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [batches, search, tab]);

  const priced = batches.filter((b) => b.price !== null && b.price !== undefined);
  const pending = batches.length - priced.length;
  const revenue = priced.reduce((s, b) => s + (b.price ?? 0), 0);
  const avg = priced.length ? revenue / priced.length : 0;

  const tiles: PerfTile[] = [
    {
      label: 'Total Batches',
      sub: 'All time',
      value: batches.length,
      delta: { value: `${pending} pending`, direction: 'flat' },
    },
    {
      label: 'Priced Revenue',
      sub: `${priced.length} priced batches`,
      value: fmtCurrency(revenue),
      delta: { value: 'tracking', direction: 'up', tone: 'positive' },
    },
    {
      label: 'Avg Batch Price',
      sub: 'Across priced batches',
      value: priced.length ? fmtCurrency(avg) : '—',
      delta: priced.length ? { value: 'stable', direction: 'flat' } : undefined,
    },
  ];

  async function submitPrice() {
    if (!editing) return;
    const num = parseFloat(price);
    if (!Number.isFinite(num) || num <= 0) {
      setErr('Price must be a positive number');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await api.put(`/batches/${editing.batchId}/price`, {
        FACTORY_ID: factoryId,
        PRICE: num,
      });
      setEditing(null);
      setPrice('');
      await reload();
    } catch (e: any) {
      setErr(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to save price');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/manager' },
        { label: 'Management' },
        { label: 'Batches' },
      ]}
      title="Batches"
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      actions={
        <>
          <DateRangeButton>Last 90 days</DateRangeButton>
          <FilterButton />
        </>
      }
    >
      <PerfSummary
        title="Performance Summary"
        description={`Pricing health for factory ${factoryId}.`}
        tiles={tiles}
      />

      <Card>
        <CardHeader
          title="All Batches"
          subtitle={`${filtered.length} / ${batches.length}`}
          right={
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch ID…"
              className="h-9 bg-white border border-border rounded-md px-3 text-sm w-48 focus:outline-none focus:border-accent-primary focus:shadow-ring transition-all"
            />
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <SkeletonBlock className="h-40 m-5" />
          ) : (
            <BatchTable
              batches={filtered}
              search={search}
              actionColumn={{
                header: 'Pricing',
                render: (b) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(b);
                      setPrice(b.price !== null ? String(b.price) : '');
                      setErr(null);
                    }}
                  >
                    {b.price !== null ? 'Edit Price' : 'Add Price'}
                  </Button>
                ),
              }}
            />
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.price !== null ? 'Edit Price' : 'Add Price'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submitPrice} disabled={submitting}>
              {submitting ? <Spinner /> : 'Save'}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary">
              Setting price for{' '}
              <span className="font-mono font-semibold text-text-primary">{editing.batchId}</span>
            </div>
            <div>
              <label className="eyebrow block mb-2">Price</label>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-text-muted">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 h-12 bg-white border border-border rounded-md px-3 font-display text-xl focus:outline-none focus:border-accent-primary focus:shadow-ring tabular transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            {err && (
              <div className="text-[12px] text-accent-danger bg-accent-danger-soft border border-red-100 rounded-md px-3 py-2">
                {err}
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
