'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { BatchListItem, BatchSummary, FactoryDashboard } from '@/types';

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getObjectPayload<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: T }).data ?? fallback) as T;
  }
  return (payload as T) ?? fallback;
}

function getArrayPayload<T>(payload: unknown, key: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}

function normalizeBatch(item: any): BatchListItem {
  return {
    batchId: item.batchId ?? item.BATCH_ID ?? '',
    lastTimestamp: item.lastTimestamp ?? item.TIMESTAMP ?? null,
    latestTemperature: num(item.latestTemperature ?? item.TEMPERATURE),
    latestHumidity: num(item.latestHumidity ?? item.HUMIDITY),
    latestRgRatio: num(item.latestRgRatio ?? item.RG_RATIO ?? item.latestColor ?? item.COLOR),
    latestMq137: num(item.latestMq137 ?? item.MQ137 ?? item.latestMq135 ?? item.MQ135),
    latestTgs2620: num(item.latestTgs2620 ?? item.TGS2620),
    latestTgs822: num(item.latestTgs822 ?? item.TGS822),
    glp: num(item.glp ?? item.GLP),
    price: num(item.price ?? item.PRICE),
  };
}

export function useFactoryBatches(factoryId: string | null, pollMs = 30_000) {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!factoryId) {
      setBatches([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/factories/${factoryId}/batches`);
      setBatches(getArrayPayload<any>(res.data, 'batches').map(normalizeBatch));
      setError(null);
    } catch (e: any) {
      setBatches([]);
      setError(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    load();
    if (pollMs && factoryId) {
      const id = window.setInterval(load, pollMs);
      return () => window.clearInterval(id);
    }
  }, [factoryId, load, pollMs]);

  return { batches, loading, error, reload: load };
}

export function useBatchSummary(batchId: string | null) {
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId) {
      setSummary(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/batches/${batchId}/summary`);
        if (!cancelled) {
          setSummary(getObjectPayload<BatchSummary | null>(res.data, null));
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setSummary(null);
          setError(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to load summary');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  return { summary, loading, error };
}

export function useFactoryDashboard(factoryId: string | null) {
  const [dashboard, setDashboard] = useState<FactoryDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factoryId) {
      setDashboard(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/factories/${factoryId}/dashboard`);
        if (!cancelled) {
          setDashboard(getObjectPayload<FactoryDashboard | null>(res.data, null));
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setDashboard(null);
          setError(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [factoryId]);

  return { dashboard, loading, error };
}
