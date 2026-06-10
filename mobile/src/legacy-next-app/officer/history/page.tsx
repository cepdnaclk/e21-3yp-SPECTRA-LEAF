'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useFactoryBatches } from '@/hooks/useBatch';
import { BatchTable } from '@/components/batch/BatchTable';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { SkeletonBlock } from '@/components/ui/Spinner';
import { PageShell, FilterButton } from '@/components/layout/PageShell';

export default function HistoryPage() {
  const router = useRouter();
  const factoryId = useAuthStore((s) => s.factoryId);
  const { batches, loading } = useFactoryBatches(factoryId);

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/officer' },
        { label: 'Operations' },
        { label: 'Batches' },
      ]}
      title="Batch History"
      actions={<FilterButton />}
    >
      <Card>
        <CardHeader title="All Batches" subtitle={`${batches.length} records`} />
        <CardBody className="p-0">
          {loading ? (
            <SkeletonBlock className="h-40 m-5" />
          ) : (
            <BatchTable
              batches={batches}
              onRowClick={(b) => router.push(`/officer/batch/${b.batchId}`)}
            />
          )}
        </CardBody>
      </Card>
    </PageShell>
  );
}
