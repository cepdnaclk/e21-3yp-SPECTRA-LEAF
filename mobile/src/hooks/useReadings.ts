import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getArrayPayload, getErrorMessage, normalizeBatch, normalizeReading } from '../lib/api';
import { BatchListItem, SensorReading } from '../types';

export function useFactoryReadings(factoryId: string, pollMs = 1_000, limit = 20) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setError(null);
      const res = await api.get(`/factories/${factoryId}/readings`, { params: { limit } });
      const arr = getArrayPayload<any>(res.data).map(normalizeReading);
      if (mounted.current) setReadings(arr);
    } catch (e) {
      if (mounted.current) setError(getErrorMessage(e));
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [factoryId, limit]);

  useEffect(() => {
    mounted.current = true;
    fetchOnce();
    const id = setInterval(fetchOnce, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [fetchOnce, pollMs]);

  return { readings, loading, error, refresh: fetchOnce };
}

export function useBatchReadings(batchId: string | null, pollMs = 1_000) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (!batchId || inFlight.current) return;
    inFlight.current = true;
    try {
      setError(null);
      const res = await api.get(`/batches/${batchId}/readings`);
      const next = getArrayPayload<any>(res.data)
        .map(normalizeReading)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      if (mounted.current) setReadings(next);
    } catch (e) {
      if (mounted.current) {
        setReadings([]);
        setError(getErrorMessage(e));
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    mounted.current = true;
    setReadings([]);
    setLoading(true);
    fetchOnce();
    const id = batchId && pollMs ? setInterval(fetchOnce, pollMs) : undefined;
    return () => {
      mounted.current = false;
      if (id) clearInterval(id);
    };
  }, [batchId, fetchOnce, pollMs]);

  return { readings, loading, error, refresh: fetchOnce };
}

export function useFactoryBatches(factoryId: string, pollMs = 5_000) {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setError(null);
      const res = await api.get(`/factories/${factoryId}/batches`);
      const arr: BatchListItem[] = getArrayPayload<any>(res.data, 'batches').map(normalizeBatch);
      if (mounted.current) setBatches(arr);
    } catch (e) {
      if (mounted.current) setError(getErrorMessage(e));
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    mounted.current = true;
    fetchOnce();
    const id = setInterval(fetchOnce, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [fetchOnce, pollMs]);

  return { batches, loading, error, refresh: fetchOnce };
}
