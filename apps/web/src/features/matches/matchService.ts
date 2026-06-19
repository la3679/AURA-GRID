import type {
  CompleteMatchInput,
  CreateMatchInput,
  MatchRecord,
  PlayerStats,
} from '@aura-grid/shared';
import { apiRequest } from '../../lib/apiClient.js';

export const createMatch = (input: CreateMatchInput): Promise<MatchRecord> =>
  apiRequest<MatchRecord>('/matches', { method: 'POST', auth: true, body: input });

export const listMatches = (): Promise<MatchRecord[]> =>
  apiRequest<MatchRecord[]>('/matches', { auth: true });

export const getMatch = (id: string): Promise<MatchRecord> =>
  apiRequest<MatchRecord>(`/matches/${id}`, { auth: true });

export const completeMatch = (
  id: string,
  input: CompleteMatchInput,
): Promise<{ match: MatchRecord; stats: PlayerStats }> =>
  apiRequest(`/matches/${id}/complete`, { method: 'PUT', auth: true, body: input });
