import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage, getObjectPayload } from '../lib/api';
import { FermentationState } from '../types';

function normalizeState(raw: any, factoryId: string): FermentationState {
  return {
    factoryId: raw?.factoryId ?? factoryId,
    status: raw?.status === 'RUNNING' ? 'RUNNING' : 'STOPPED',
    batchId: raw?.batchId ?? null,
    deviceId: raw?.deviceId ?? null,
    startedAt: raw?.startedAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
  };
}

export function useFermentationState(factoryId: string, pollMs = 5_000) {
  const [state, setState] = useState<FermentationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const response = await api.get(`/fermentation/state/${factoryId}`);
      const payload = getObjectPayload<any>(response.data, {});
      if (mounted.current) {
        setState(normalizeState(payload, factoryId));
        setError(null);
      }
    } catch (err) {
      if (mounted.current) setError(getErrorMessage(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const timer = setInterval(refresh, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [pollMs, refresh]);

  return {
    state,
    isLive: state?.status === 'RUNNING',
    loading,
    error,
    refresh,
  };
}
