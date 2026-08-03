'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { FermentationState } from '@/types';

function getState(payload: any, factoryId: string): FermentationState {
  const data = payload?.data ?? payload ?? {};
  return {
    factoryId: data.factoryId ?? factoryId,
    status: data.status === 'RUNNING' ? 'RUNNING' : 'STOPPED',
    batchId: data.batchId ?? null,
    deviceId: data.deviceId ?? null,
    startedAt: data.startedAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function useFermentationState(factoryId: string | null, pollMs = 1_000) {
  const [state, setState] = useState<FermentationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const reload = useCallback(async () => {
    if (!factoryId) {
      setState(null);
      setLoading(false);
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      const response = await api.get(`/fermentation/state/${factoryId}`);
      setState(getState(response.data, factoryId));
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message
        ?? err.response?.data?.error
        ?? 'Failed to load fermentation state',
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    reload();
    if (!factoryId || !pollMs) return;

    const timer = window.setInterval(reload, pollMs);
    return () => window.clearInterval(timer);
  }, [factoryId, pollMs, reload]);

  return {
    state,
    isLive: state?.status === 'RUNNING',
    loading,
    error,
    reload,
  };
}
