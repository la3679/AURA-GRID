import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../src/features/theme/ThemeToggle.js';
import { useThemeStore } from '../src/features/theme/themeStore.js';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().setTheme('dark');
  });

  it('cycles the theme on click and applies the class to the document', async () => {
    render(<ThemeToggle />);
    expect(useThemeStore.getState().theme).toBe('dark');

    await userEvent.click(screen.getByRole('button'));
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    await userEvent.click(screen.getByRole('button'));
    expect(useThemeStore.getState().theme).toBe('system');
  });
});
