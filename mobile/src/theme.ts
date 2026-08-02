import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 44,
};

const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

const font = {
  display: 34,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 10,
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    background: '#040705',
    surface: '#0A0F0C',
    elevated: '#101713',
    subtle: '#151E18',
    border: '#1D2A21',
    borderActive: '#32493A',
    primary: '#3CF28A',
    primaryDark: '#0D8A48',
    primaryLight: '#91FBB9',
    primarySoft: '#0D2B1A',
    accent: '#D8FFE6',
    accentSoft: '#14241A',
    text: '#F7FFF9',
    textSecondary: '#BED0C3',
    textMuted: '#718078',
    danger: '#FF6868',
    dangerSoft: '#2C1214',
    dangerText: '#FFB4B4',
    warning: '#DDFB7A',
    warningSoft: '#202813',
    warningBorder: '#3C4720',
    success: '#3CF28A',
    info: '#B9E8C9',
    dark: '#020403',
    darkSoft: '#080C09',
    ink: '#031008',
    inkMuted: '#1D5A35',
    overlay: 'rgba(0,0,0,0.72)',
    nav: '#080D0A',
    navBorder: '#223128',
    chartGrid: '#1B2B20',
  },
  spacing,
  radius,
  font,
};

export const lightTheme = {
  mode: 'light' as const,
  colors: {
    background: '#F4F8F4',
    surface: '#FFFFFF',
    elevated: '#EDF4EE',
    subtle: '#E6EFE8',
    border: '#D7E4D9',
    borderActive: '#A8C6AF',
    primary: '#20C873',
    primaryDark: '#087C42',
    primaryLight: '#66E6A0',
    primarySoft: '#E0F8E9',
    accent: '#0C5A32',
    accentSoft: '#EAF7EF',
    text: '#09150D',
    textSecondary: '#385444',
    textMuted: '#6A7F70',
    danger: '#D93F4B',
    dangerSoft: '#FDEBED',
    dangerText: '#A5222E',
    warning: '#756800',
    warningSoft: '#FFF9D8',
    warningBorder: '#E6D979',
    success: '#15975A',
    info: '#24734A',
    dark: '#031008',
    darkSoft: '#102519',
    ink: '#031008',
    inkMuted: '#1D5A35',
    overlay: 'rgba(3,16,8,0.38)',
    nav: '#FFFFFF',
    navBorder: '#D5E4D8',
    chartGrid: '#DCE9DF',
  },
  spacing,
  radius,
  font,
};

export type AppTheme = typeof darkTheme | typeof lightTheme;
export type ThemeMode = AppTheme['mode'];

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      mode: 'dark',
      setMode: mode => set({ mode }),
      toggleMode: () => set(state => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'spectraleaf-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ mode: state.mode }),
    },
  ),
);

export function useAppTheme(): AppTheme {
  const mode = useThemeStore(state => state.mode);
  return mode === 'dark' ? darkTheme : lightTheme;
}

export function useThemedStyles<T>(factory: (activeTheme: AppTheme) => T): T {
  const activeTheme = useAppTheme();
  return useMemo(() => factory(activeTheme), [activeTheme, factory]);
}

// Kept for non-react helpers; screens and components use useAppTheme at runtime.
export const theme = darkTheme;
export type Theme = AppTheme;
