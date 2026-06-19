import { create } from 'zustand';
import {
  DEFAULT_PLAYER_STATS,
  DEFAULT_PREFERENCES,
  type CharacterClassId,
  type UserProfile,
} from '@aura-grid/shared';

export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'anonymous';

const GUEST_KEY = 'aura-grid:guest';

export interface GuestProfile {
  callsign: string;
  selectedClass: CharacterClassId;
  auraColor: string;
}

const readGuest = (): GuestProfile | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as GuestProfile) : null;
  } catch {
    return null;
  }
};

interface AuthState {
  status: AuthStatus;
  profile: UserProfile | null;
  guest: GuestProfile | null;
  setStatus: (status: AuthStatus) => void;
  setProfile: (profile: UserProfile | null) => void;
  startGuest: (guest: GuestProfile) => void;
  clearGuest: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  profile: null,
  guest: readGuest(),
  setStatus: (status) => set({ status }),
  setProfile: (profile) =>
    set({ profile, status: profile ? 'authenticated' : 'anonymous', guest: null }),
  startGuest: (guest) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    set({ guest, status: 'guest', profile: null });
  },
  clearGuest: () => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(GUEST_KEY);
    set({ guest: null });
  },
  reset: () => set({ status: 'anonymous', profile: null }),
}));

/** Build a synthetic UserProfile for a guest so UI can render uniformly. */
export const guestToProfile = (guest: GuestProfile): UserProfile => ({
  uid: 'guest',
  email: '',
  displayName: guest.callsign,
  callsign: guest.callsign,
  selectedClass: guest.selectedClass,
  auraColor: guest.auraColor,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stats: { ...DEFAULT_PLAYER_STATS },
  preferences: { ...DEFAULT_PREFERENCES },
});
