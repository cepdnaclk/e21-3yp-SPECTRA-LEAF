import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage, getObjectPayload } from '../lib/api';
import { FermentationState } from '../types';

type StateListener = (state: FermentationState) => void;

const localStates = new Map<string, FermentationState>();
const localStateListeners = new Map<string, Set<StateListener>>();

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

export function publishFermentationState(state: FermentationState) {
  localStates.set(state.factoryId, state);
  localStateListeners.get(state.factoryId)?.forEach(listener => listener(state));
}

export function useFermentationState(factoryId: string, pollMs = 5_000) {
  const [state, setState] = useState<FermentationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const mounted = useRef(true);
  const unsupported = useRef(false);

  const refresh = useCallback(async () => {
    if (unsupported.current) return;
    try {
      const response = await api.get(`/fermentation/state/${factoryId}`);
      const payload = getObjectPayload<any>(response.data, {});
      if (mounted.current) {
        setState(normalizeState(payload, factoryId));
        setError(null);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        unsupported.current = true;
        if (mounted.current) {
          setState(localStates.get(factoryId) ?? normalizeState({}, factoryId));
          setSupported(false);
          setError(null);
        }
      } else if (mounted.current) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    mounted.current = true;
    unsupported.current = false;
    setSupported(true);
    const listeners = localStateListeners.get(factoryId) ?? new Set<StateListener>();
    const handleLocalState: StateListener = nextState => {
      if (mounted.current) setState(nextState);
    };
    listeners.add(handleLocalState);
    localStateListeners.set(factoryId, listeners);
    const localState = localStates.get(factoryId);
    if (localState) setState(localState);
    refresh();
    const timer = setInterval(refresh, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      listeners.delete(handleLocalState);
      if (listeners.size === 0) localStateListeners.delete(factoryId);
    };
  }, [factoryId, pollMs, refresh]);

  return {
    state,
    isLive: state?.status === 'RUNNING',
    loading,
    error,
    supported,
    refresh,
  };
}
