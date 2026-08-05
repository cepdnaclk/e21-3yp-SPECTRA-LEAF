import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { OfficerProfile, Role } from '../types';

const OFFICER_FACTORY_ID = 'FAC001';
export const DEFAULT_LOGIN_EMAIL =
  process.env.EXPO_PUBLIC_DEFAULT_LOGIN_EMAIL ?? 'officer@spectraleaf.local';
export const DEFAULT_LOGIN_PASSWORD =
  process.env.EXPO_PUBLIC_DEFAULT_LOGIN_PASSWORD ?? 'change-me';

interface AuthStore {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  factoryId: string;
  displayName: string;
  profile: OfficerProfile;
  liveAlertsEnabled: boolean;
  loginEmail: string;
  loginPassword: string;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  updateProfile: (patch: Partial<OfficerProfile>) => void;
  setLiveAlertsEnabled: (enabled: boolean) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const defaultProfile: OfficerProfile = {
  displayName: 'Factory Officer',
  email: DEFAULT_LOGIN_EMAIL,
  phone: '+94 70 000 0000',
  shift: 'Day Shift',
  factoryId: OFFICER_FACTORY_ID,
  role: 'OFFICER',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      isAuthenticated: false,
      role: null,
      factoryId: OFFICER_FACTORY_ID,
      displayName: 'Factory Officer',
      profile: defaultProfile,
      liveAlertsEnabled: true,
      loginEmail: DEFAULT_LOGIN_EMAIL,
      loginPassword: DEFAULT_LOGIN_PASSWORD,
      signIn: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const state = get();
        const valid =
          cleanEmail === state.loginEmail.toLowerCase() && password === state.loginPassword;
        if (valid) {
          set({ isAuthenticated: true, role: 'OFFICER' });
        }
        return valid;
      },
      signOut: () => set({ isAuthenticated: false, role: null }),
      updateProfile: patch =>
        set(state => {
          const email = patch.email?.trim().toLowerCase();
          return {
            profile: { ...state.profile, ...patch, ...(email ? { email } : {}) },
            displayName: patch.displayName ?? state.displayName,
            factoryId: patch.factoryId ?? state.factoryId,
            loginEmail: email || state.loginEmail,
          };
        }),
      setLiveAlertsEnabled: liveAlertsEnabled => set({ liveAlertsEnabled }),
      changePassword: (currentPassword, newPassword) => {
        if (currentPassword !== get().loginPassword || newPassword.length < 8) {
          return false;
        }
        set({ loginPassword: newPassword });
        return true;
      },
      setHasHydrated: hasHydrated => set({ hasHydrated }),
    }),
    {
      name: 'spectraleaf-officer-account-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        factoryId: state.factoryId,
        displayName: state.displayName,
        profile: state.profile,
        liveAlertsEnabled: state.liveAlertsEnabled,
        loginEmail: state.loginEmail,
        loginPassword: state.loginPassword,
      }),
      onRehydrateStorage: () => state => state?.setHasHydrated(true),
    },
  ),
);
