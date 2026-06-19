import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient.js';
import { AuthProvider } from '../features/auth/AuthProvider.js';
import { ToastViewport } from '../features/toast/ToastViewport.js';
import { applyTheme, useThemeStore } from '../features/theme/themeStore.js';
import { ErrorBoundary } from './ErrorBoundary.js';

export const Providers = ({ children }: { children: ReactNode }) => {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (useThemeStore.getState().theme === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <ToastViewport />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
