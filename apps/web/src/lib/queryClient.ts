import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

/** Stable query keys + their stale times (ms), per the cache plan. */
export const queryKeys = {
  profile: ['profile'] as const,
  stats: ['stats'] as const,
  matches: ['matches'] as const,
  match: (id: string) => ['match', id] as const,
  leaderboard: ['leaderboard'] as const,
};

export const STALE = {
  profile: 5 * 60_000,
  leaderboard: 60_000,
  matches: 2 * 60_000,
  aiSummary: 30 * 60_000,
};
