import { useAuthStore, guestToProfile } from './authStore.js';
import type { UserProfile } from '@aura-grid/shared';

export interface AuthView {
  status: ReturnType<typeof useAuthStore.getState>['status'];
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  /** A profile to render — real for authenticated users, synthetic for guests. */
  profile: UserProfile | null;
}

export const useAuth = (): AuthView => {
  const { status, profile, guest } = useAuthStore();
  return {
    status,
    isAuthenticated: status === 'authenticated',
    isGuest: status === 'guest',
    isLoading: status === 'loading',
    profile: profile ?? (guest ? guestToProfile(guest) : null),
  };
};
