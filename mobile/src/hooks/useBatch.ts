import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage, getObjectPayload, normalizeGraphs, normalizeSummary } from '../lib/api';
import { BatchGraphs, BatchSummary } from '../types';

export function useBatchSummary(batchId: string | null) {
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchOnce = useCallback(async () => {
    if (!batchId) return;
    try {
      setError(null);
      const res = await api.get(`/batches/${batchId}/summary`);
      const data = normalizeSummary(getObjectPayload<any>(res.data, null));
      if (mounted.current) setSummary(data || null);
    } catch (e: any) {
      // 404 means no GLP/summary set yet — normal for active batches, not an error
      if (e?.response?.status === 404) {
        if (mounted.current) setSummary(null);
      } else {
        if (mounted.current) setError(getErrorMessage(e));
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    mounted.current = true;
    fetchOnce();
    return () => { mounted.current = false; };
  }, [fetchOnce]);

  return { summary, loading, error, refresh: fetchOnce };
}

export function useBatchGraphs(batchId: string | null, pollMs = 1_000) {
  const [graphs, setGraphs] = useState<BatchGraphs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (!batchId || inFlight.current) return;
    inFlight.current = true;
    try {
      setError(null);
      const res = await api.get(`/batches/${batchId}/graphs`);
      const g: BatchGraphs = normalizeGraphs(res.data, batchId);
      if (mounted.current) setGraphs(g);
    } catch (e) {
      if (mounted.current) setError(getErrorMessage(e));
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    mounted.current = true;
    setGraphs(null);
    setLoading(true);
    fetchOnce();
    const id = pollMs ? setInterval(fetchOnce, pollMs) : undefined;
    return () => {
      mounted.current = false;
      if (id) clearInterval(id);
    };
  }, [fetchOnce, pollMs]);

  return { graphs, loading, error, refresh: fetchOnce };
}
