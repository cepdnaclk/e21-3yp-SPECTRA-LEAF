import { create } from 'zustand';
import { OfficerProfile, Role } from '../types';

const OFFICER_FACTORY_ID = 'FAC001';

interface AuthStore {
  role: Role | null;
  factoryId: string;
  displayName: string;
  profile: OfficerProfile;
  signIn: (factoryId: string, displayName: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<OfficerProfile>) => void;
}

const defaultProfile: OfficerProfile = {
  displayName: 'Factory Officer',
  email: 'officer@spectraleaf.io',
  phone: '+94 70 000 0000',
  shift: 'Day Shift',
  factoryId: OFFICER_FACTORY_ID,
  role: 'OFFICER',
};

export const useAuthStore = create<AuthStore>(set => ({
  role: null,
  factoryId: OFFICER_FACTORY_ID,
  displayName: 'Factory Officer',
  profile: defaultProfile,
  signIn: (factoryId, displayName) =>
    set(state => ({
      role: 'OFFICER',
      factoryId,
      displayName,
      profile: { ...state.profile, factoryId, displayName },
    })),
  signOut: () =>
    set({
      role: null,
      factoryId: OFFICER_FACTORY_ID,
      displayName: 'Factory Officer',
      profile: defaultProfile,
    }),
  updateProfile: patch =>
    set(state => ({
      profile: { ...state.profile, ...patch },
      displayName: patch.displayName ?? state.displayName,
      factoryId: patch.factoryId ?? state.factoryId,
    })),
}));
