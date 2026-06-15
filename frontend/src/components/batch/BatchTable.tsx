'use client';

import { useMemo, useState } from 'react';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { fmtDate, fmtCurrency } from '@/lib/utils';
import type { BatchListItem } from '@/types';
import { api } from '@/lib/api';
import { fetchAuthSession } from 'aws-amplify/auth';

type SortKey = 'batchId' | 'lastTimestamp' | 'glp' | 'price';
type SortDir = 'asc' | 'desc';

interface Props {
  batches: BatchListItem[];
  search?: string;
  onRowClick?: (b: BatchListItem) => void;
  actionColumn?: { header: string; render: (b: BatchListItem) => React.ReactNode };
}

function highlight(text: string, term?: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-accent-primary/20 text-accent-primary">
        {text.slice(idx, idx + term.length)}
      </span>
      {text.slice(idx + term.length)}
    </>
  );
}

export function BatchTable({ batches, search, onRowClick, actionColumn }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('lastTimestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function toggle(k: SortKey) {
    if (k === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(k);
      setSortDir('desc');
    }
  }

  const sorted = useMemo(() => {
    const arr = [...batches];
    arr.sort((a, b) => {
      const av = (a[sortKey] ?? '') as string | number;
      const bv = (b[sortKey] ?? '') as string | number;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [batches, sortKey, sortDir]);

  const colCount = 9 + (actionColumn ? 1 : 0);

  return (
    <Table>
      <Thead>
        <Th onClick={() => toggle('batchId')} active={sortKey === 'batchId'} dir={sortDir}>
          Batch ID
        </Th>
        <Th onClick={() => toggle('lastTimestamp')} active={sortKey === 'lastTimestamp'} dir={sortDir}>
          Last Seen
        </Th>
        <Th>Temperature</Th>
        <Th>RG Ratio</Th>
        <Th>MQ137</Th>
        <Th>TGS2620</Th>
        <Th>TGS822</Th>
        <Th onClick={() => toggle('glp')} active={sortKey === 'glp'} dir={sortDir}>
          GLP %
        </Th>
        <Th onClick={() => toggle('price')} active={sortKey === 'price'} dir={sortDir}>
          Price
        </Th>
        {actionColumn && <Th className="text-right">{actionColumn.header}</Th>}
      </Thead>
      <tbody>
        {sorted.length === 0 && (
          <tr>
            <td colSpan={colCount} className="px-4 py-12 text-center text-text-muted text-sm">
              No batches found.
            </td>
          </tr>
        )}
        {sorted.map((b) => {
          const isActive = b.glp === null || b.glp === undefined;
          return (
          <Tr key={b.batchId} onClick={onRowClick ? () => onRowClick(b) : undefined} className={isActive ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
            <Td className="font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span>{highlight(b.batchId, search)}</span>
              </div>
            </Td>
            <Td className="text-text-secondary text-xs">{fmtDate(b.lastTimestamp)}</Td>
            <Td className="tabular text-xs">
              {b.latestTemperature != null ? `${b.latestTemperature.toFixed(1)} °C` : '—'}
            </Td>
            <Td className="tabular text-xs">
              {b.latestRgRatio != null ? b.latestRgRatio.toFixed(1) : '—'}
            </Td>
            <Td className="tabular text-xs">
              {b.latestMq137 != null ? b.latestMq137.toFixed(0) : '—'}
            </Td>
            <Td className="tabular text-xs">
              {b.latestTgs2620 != null ? b.latestTgs2620.toFixed(0) : '—'}
            </Td>
            <Td className="tabular text-xs">
              {b.latestTgs822 != null ? b.latestTgs822.toFixed(0) : '—'}
            </Td>
            <Td className="tabular">
              {b.glp !== null && b.glp !== undefined ? `${b.glp}%` : '—'}
            </Td>
            <Td className="tabular font-display">{fmtCurrency(b.price ?? undefined)}</Td>
            {actionColumn && (
              <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                {actionColumn.render(b)}
              </Td>
            )}
          </Tr>
        )})}
      </tbody>
    </Table>
  );
}
