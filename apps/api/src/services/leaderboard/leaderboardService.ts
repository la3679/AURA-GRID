import type { LeaderboardEntry, UserProfile } from '@aura-grid/shared';
import { getFirestore } from '../firebase/firebaseAdmin.js';
import { getProfile } from '../users/userService.js';

const memoryEntries = new Map<string, LeaderboardEntry>();
export const __resetLeaderboardStore = (): void => memoryEntries.clear();

const toEntry = (profile: UserProfile): LeaderboardEntry => ({
  uid: profile.uid,
  callsign: profile.callsign,
  level: profile.stats.level,
  xp: profile.stats.xp,
  wins: profile.stats.wins,
  losses: profile.stats.losses,
  winRate: profile.stats.winRate,
  bestStreak: profile.stats.bestStreak,
  updatedAt: new Date().toISOString(),
});

/** Sync the user's current profile stats into the global leaderboard. */
export const syncEntry = async (uid: string): Promise<LeaderboardEntry | null> => {
  const profile = await getProfile(uid);
  if (!profile) return null;
  const entry = toEntry(profile);
  const db = await getFirestore();
  if (db) {
    await db.collection('leaderboards').doc('global').collection('entries').doc(uid).set(entry);
  } else {
    memoryEntries.set(uid, entry);
  }
  return entry;
};

/** Normalized, ranked leaderboard (descending by xp then wins). */
export const getLeaderboard = async (limit = 50): Promise<LeaderboardEntry[]> => {
  const db = await getFirestore();
  let entries: LeaderboardEntry[];
  if (db) {
    const snap = await db
      .collection('leaderboards')
      .doc('global')
      .collection('entries')
      .orderBy('xp', 'desc')
      .limit(limit)
      .get();
    entries = snap.docs.map((d: { data: () => LeaderboardEntry }) => d.data());
  } else {
    entries = [...memoryEntries.values()];
  }
  return entries
    .sort((a, b) => b.xp - a.xp || b.wins - a.wins)
    .slice(0, limit);
};
