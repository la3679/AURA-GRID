import type { LeaderboardEntry } from '@aura-grid/shared';
import { apiRequest } from '../../lib/apiClient.js';

export const getLeaderboard = (): Promise<LeaderboardEntry[]> =>
  apiRequest<LeaderboardEntry[]>('/leaderboard');
