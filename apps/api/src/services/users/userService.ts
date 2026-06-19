import {
  DEFAULT_PLAYER_STATS,
  DEFAULT_PREFERENCES,
  type PlayerStats,
  type UpdateProfileInput,
  type UserPreferences,
  type UserProfile,
} from '@aura-grid/shared';
import { getFirestore } from '../firebase/firebaseAdmin.js';
import { NotFoundError } from '../../utils/errors.js';

/** Ephemeral dev store used when Firebase is not configured. Not persistent. */
const memoryUsers = new Map<string, UserProfile>();
export const __resetUserStore = (): void => memoryUsers.clear();

const nowIso = (): string => new Date().toISOString();

export interface CreateProfileInput {
  uid: string;
  email: string;
  displayName: string;
  callsign: string;
  selectedClass: UserProfile['selectedClass'];
  auraColor: string;
}

const buildProfile = (input: CreateProfileInput): UserProfile => ({
  uid: input.uid,
  email: input.email,
  displayName: input.displayName,
  callsign: input.callsign,
  selectedClass: input.selectedClass,
  auraColor: input.auraColor,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  stats: { ...DEFAULT_PLAYER_STATS },
  preferences: { ...DEFAULT_PREFERENCES } as UserPreferences,
});

export const getProfile = async (uid: string): Promise<UserProfile | null> => {
  const db = await getFirestore();
  if (db) {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? (snap.data() as UserProfile) : null;
  }
  return memoryUsers.get(uid) ?? null;
};

export const upsertProfile = async (input: CreateProfileInput): Promise<UserProfile> => {
  const existing = await getProfile(input.uid);
  const profile = existing
    ? { ...existing, email: input.email, updatedAt: nowIso() }
    : buildProfile(input);

  const db = await getFirestore();
  if (db) {
    await db.collection('users').doc(input.uid).set(profile, { merge: true });
  } else {
    memoryUsers.set(input.uid, profile);
  }
  return profile;
};

export const updateProfile = async (
  uid: string,
  patch: UpdateProfileInput,
): Promise<UserProfile> => {
  const existing = await getProfile(uid);
  if (!existing) throw new NotFoundError('Profile not found.');

  const next: UserProfile = {
    ...existing,
    ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
    ...(patch.callsign !== undefined ? { callsign: patch.callsign } : {}),
    ...(patch.selectedClass !== undefined ? { selectedClass: patch.selectedClass } : {}),
    ...(patch.auraColor !== undefined ? { auraColor: patch.auraColor } : {}),
    ...(patch.photoURL !== undefined ? { photoURL: patch.photoURL } : {}),
    preferences: { ...existing.preferences, ...(patch.preferences ?? {}) },
    updatedAt: nowIso(),
  };

  const db = await getFirestore();
  if (db) {
    await db.collection('users').doc(uid).set(next, { merge: true });
  } else {
    memoryUsers.set(uid, next);
  }
  return next;
};

/** Apply a completed match's outcome to the user's aggregate stats. */
export const applyMatchToStats = async (
  uid: string,
  outcome: {
    won: boolean;
    lanesCaptured: number;
    bumps: number;
    perfectSplits: number;
  },
): Promise<PlayerStats> => {
  const existing = await getProfile(uid);
  if (!existing) throw new NotFoundError('Profile not found.');

  const s = existing.stats;
  const wins = s.wins + (outcome.won ? 1 : 0);
  const losses = s.losses + (outcome.won ? 0 : 1);
  const gamesPlayed = s.gamesPlayed + 1;
  const currentStreak = outcome.won ? s.currentStreak + 1 : 0;
  const xp = s.xp + (outcome.won ? 100 : 25) + outcome.bumps * 5 + outcome.perfectSplits * 10;

  const stats: PlayerStats = {
    gamesPlayed,
    wins,
    losses,
    winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    lanesCaptured: s.lanesCaptured + outcome.lanesCaptured,
    bumpsTriggered: s.bumpsTriggered + outcome.bumps,
    perfectSplits: s.perfectSplits + outcome.perfectSplits,
    currentStreak,
    bestStreak: Math.max(s.bestStreak, currentStreak),
    xp,
    level: Math.floor(xp / 500) + 1,
  };

  const next = { ...existing, stats, updatedAt: nowIso() };
  const db = await getFirestore();
  if (db) {
    await db.collection('users').doc(uid).set(next, { merge: true });
  } else {
    memoryUsers.set(uid, next);
  }
  return stats;
};
