import type { PlayerStats, UpdateProfileInput, UserProfile } from '@aura-grid/shared';
import { apiRequest } from '../../lib/apiClient.js';

export const getProfile = (): Promise<UserProfile> =>
  apiRequest<UserProfile>('/users/me', { auth: true });

export const getStats = (): Promise<PlayerStats> =>
  apiRequest<PlayerStats>('/users/me/stats', { auth: true });

export const updateProfile = (patch: UpdateProfileInput): Promise<UserProfile> =>
  apiRequest<UserProfile>('/users/me', { method: 'PUT', auth: true, body: patch });
