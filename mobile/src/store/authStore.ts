import { create } from 'zustand';
import { OfficerProfile, Role } from '../types';

const OFFICER_FACTORY_ID = 'FAC001';
const DEFAULT_PROFILE_EMAIL =
  process.env.EXPO_PUBLIC_DEFAULT_LOGIN_EMAIL ?? 'officer@spectraleaf.local';

interface AuthStore {
  isAuthenticated: boolean;
  role: Role | null;
  factoryId: string;
  displayName: string;
  profile: OfficerProfile;
  signIn: (email: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<OfficerProfile>) => void;
}

const defaultProfile: OfficerProfile = {
  displayName: 'Factory Officer',
  email: DEFAULT_PROFILE_EMAIL,
  phone: '+94 70 000 0000',
  shift: 'Day Shift',
  factoryId: OFFICER_FACTORY_ID,
  role: 'OFFICER',
};

export const useAuthStore = create<AuthStore>(set => ({
  isAuthenticated: false,
  role: null,
  factoryId: OFFICER_FACTORY_ID,
  displayName: 'Factory Officer',
  profile: defaultProfile,
  signIn: email =>
    set(state => ({
      isAuthenticated: true,
      role: 'OFFICER',
      profile: { ...state.profile, email },
    })),
  signOut: () => set({ isAuthenticated: false, role: null }),
  updateProfile: patch =>
    set(state => ({
      profile: { ...state.profile, ...patch },
      displayName: patch.displayName ?? state.displayName,
      factoryId: patch.factoryId ?? state.factoryId,
    })),
}));
