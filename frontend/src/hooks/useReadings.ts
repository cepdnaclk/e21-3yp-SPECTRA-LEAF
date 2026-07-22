'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { BatchGraphs, GraphPoint, SensorReading } from '@/types';

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];
  }
  return [];
}

function getObjectPayload<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: T }).data ?? fallback) as T;
  }
  return (payload as T) ?? fallback;
}

function normalizeReading(item: any): SensorReading {
  return {
    timestamp: item.timestamp ?? item.TIMESTAMP ?? '',
    deviceId: item.deviceId ?? item.DEVICE_ID ?? null,
    factoryId: item.factoryId ?? item.FACTORY_ID ?? null,
    batchId: item.batchId ?? item.BATCH_ID ?? null,
    temperature: num(item.temperature ?? item.TEMPERATURE),
    humidity: num(item.humidity ?? item.HUMIDITY),
    rgRatio: num(item.rgRatio ?? item.RG_RATIO ?? item.color ?? item.COLOR),
    mq137: num(item.mq137 ?? item.MQ137 ?? item.mq135 ?? item.MQ135),
    tgs2620: num(item.tgs2620 ?? item.TGS2620),
    tgs822: num(item.tgs822 ?? item.TGS822),
  };
}

function normalizePoints(items: any[] | undefined): GraphPoint[] {
  return (items ?? []).map((p) => ({
    timestamp: p.timestamp ?? p.TIMESTAMP ?? '',
    value: Number(p.value ?? p.VALUE ?? 0),
  }));
}

export function useFactoryReadings(factoryId: string | null, pollMs = 30_000, limit = 20) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!factoryId) {
      setReadings([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/factories/${factoryId}/readings`, { params: { limit } });
      setReadings(getArrayPayload<any>(res.data).map(normalizeReading));
      setError(null);
    } catch (e: any) {
      setReadings([]);
      setError(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to load readings');
    } finally {
      setLoading(false);
    }
  }, [factoryId, limit]);

  useEffect(() => {
    load();
    if (pollMs && factoryId) {
      const id = window.setInterval(load, pollMs);
      return () => window.clearInterval(id);
    }
  }, [factoryId, load, pollMs]);

  return { readings, loading, error, reload: load };
}

export function useBatchGraphs(batchId: string | null) {
  const [graphs, setGraphs] = useState<BatchGraphs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId) {
      setGraphs(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/batches/${batchId}/graphs`);
        const payload = getObjectPayload<any>(res.data, {});
        if (!cancelled) {
          setGraphs({
            temperature: normalizePoints(payload.temperature),
            humidity: normalizePoints(payload.humidity),
            rgRatio: normalizePoints(payload.rgRatio ?? payload.color),
            mq137: normalizePoints(payload.mq137 ?? payload.mq135),
            tgs2620: normalizePoints(payload.tgs2620),
            tgs822: normalizePoints(payload.tgs822),
          });
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setGraphs({
            temperature: [],
            humidity: [],
            rgRatio: [],
            mq137: [],
            tgs2620: [],
            tgs822: [],
          });
          setError(e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to load graphs');
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

  return { graphs, loading, error };
}
