import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme as nwColorScheme } from 'nativewind';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = '@app/theme-mode';

type ThemeContextType = {
  mode: ThemeMode;
  effectiveScheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load saved mode on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw === 'light' || raw === 'dark' || raw === 'system') {
        setModeState(raw);
      }
    });
  }, []);

  const effectiveScheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  // Sync ke NativeWind setiap kali effective scheme berubah
  useEffect(() => {
    nwColorScheme.set(mode === 'system' ? 'system' : effectiveScheme);
  }, [mode, effectiveScheme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ mode, effectiveScheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error('useThemePreference must be used inside <ThemePreferenceProvider>');
  return ctx;
}
