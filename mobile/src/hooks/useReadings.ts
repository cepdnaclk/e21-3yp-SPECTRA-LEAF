import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getArrayPayload, getErrorMessage, normalizeBatch, normalizeReading } from '../lib/api';
import { BatchListItem, SensorReading } from '../types';

export function useFactoryReadings(factoryId: string, pollMs = 30000, limit = 20) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchOnce = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get(`/factories/${factoryId}/readings`, { params: { limit } });
      const arr = getArrayPayload<any>(res.data).map(normalizeReading);
      if (mounted.current) setReadings(arr);
    } catch (e) {
      if (mounted.current) setError(getErrorMessage(e));
    } finally {
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

export function useFactoryBatches(factoryId: string, pollMs = 30000) {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchOnce = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get(`/factories/${factoryId}/batches`);
      const arr: BatchListItem[] = getArrayPayload<any>(res.data, 'batches').map(normalizeBatch);
      if (mounted.current) setBatches(arr);
    } catch (e) {
      if (mounted.current) setError(getErrorMessage(e));
    } finally {
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

  return { batches, setBatches, loading, error, refresh: fetchOnce };
}
