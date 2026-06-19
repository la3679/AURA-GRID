import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeStore } from './themeStore.js';

const labels = {
  dark: 'Dark theme',
  light: 'Light theme',
  system: 'System theme',
} as const;

export const ThemeToggle = () => {
  const { theme, cycleTheme } = useThemeStore();
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Switch theme (current: ${labels[theme]})`}
      title={labels[theme]}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <Icon size={18} />
    </button>
  );
};
