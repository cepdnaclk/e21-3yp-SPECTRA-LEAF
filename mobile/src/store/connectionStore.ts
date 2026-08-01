import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { configureApiBaseURL, getDefaultApiBaseURL, normalizeApiBaseURL } from '../lib/api';

interface ConnectionStore {
  hasHydrated: boolean;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    set => ({
      hasHydrated: false,
      apiBaseUrl: getDefaultApiBaseURL(),
      setApiBaseUrl: url => {
        const normalized = normalizeApiBaseURL(url);
        configureApiBaseURL(normalized);
        set({ apiBaseUrl: normalized });
      },
      setHasHydrated: hasHydrated => set({ hasHydrated }),
    }),
    {
      name: 'spectraleaf-api-connection-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ apiBaseUrl: state.apiBaseUrl }),
      onRehydrateStorage: () => state => {
        if (state) {
          configureApiBaseURL(state.apiBaseUrl);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
