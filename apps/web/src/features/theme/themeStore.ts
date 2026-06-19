import { create } from 'zustand';
import type { ThemePreference } from '@aura-grid/shared';

const STORAGE_KEY = 'aura-grid:theme';

const readStored = (): ThemePreference => {
  if (typeof localStorage === 'undefined') return 'system';
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
};

const systemPrefersDark = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;

export const resolveTheme = (pref: ThemePreference): 'light' | 'dark' =>
  pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref;

export const applyTheme = (pref: ThemePreference): void => {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
};

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStored(),
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  cycleTheme: () => {
    const order: ThemePreference[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(get().theme) + 1) % order.length]!;
    get().setTheme(next);
  },
}));
