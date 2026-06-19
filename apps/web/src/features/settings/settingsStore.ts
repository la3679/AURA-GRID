import { create } from 'zustand';

const KEY = 'aura-grid:settings';

export interface LocalSettings {
  reducedMotion: boolean;
  soundEnabled: boolean;
  commentaryEnabled: boolean;
}

const defaults: LocalSettings = {
  reducedMotion: false,
  soundEnabled: false,
  commentaryEnabled: true,
};

const read = (): LocalSettings => {
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<LocalSettings>) } : defaults;
  } catch {
    return defaults;
  }
};

interface SettingsState extends LocalSettings {
  set: (patch: Partial<LocalSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...read(),
  set: (patch) => {
    const next = { ...get(), ...patch };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          reducedMotion: next.reducedMotion,
          soundEnabled: next.soundEnabled,
          commentaryEnabled: next.commentaryEnabled,
        }),
      );
    }
    set(patch);
  },
}));
