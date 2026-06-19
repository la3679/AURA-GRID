import { randomUUID } from 'node:crypto';
import type { CompleteMatchInput, CreateMatchInput, MatchRecord } from '@aura-grid/shared';
import { getFirestore } from '../firebase/firebaseAdmin.js';
import { NotFoundError } from '../../utils/errors.js';

const memoryMatches = new Map<string, MatchRecord>();
export const __resetMatchStore = (): void => memoryMatches.clear();

const nowIso = (): string => new Date().toISOString();

export const createMatch = async (
  uid: string,
  input: CreateMatchInput,
): Promise<MatchRecord> => {
  const record: MatchRecord = {
    id: randomUUID(),
    userId: uid,
    opponentType: input.opponentType,
    opponentName: input.opponentName,
    status: 'ABANDONED',
    winner: 'OPPONENT',
    startedAt: nowIso(),
    endedAt: nowIso(),
    durationSeconds: 0,
    finalPositions: { player: [0, 0, 0, 0, 0, 0], opponent: [0, 0, 0, 0, 0, 0] },
    turns: 0,
    rolls: [],
    bumps: 0,
    lanesCompleted: 0,
  };
  const db = await getFirestore();
  if (db) {
    await db.collection('matches').doc(record.id).set(record);
  } else {
    memoryMatches.set(record.id, record);
  }
  return record;
};

export const completeMatch = async (
  uid: string,
  matchId: string,
  input: CompleteMatchInput,
): Promise<MatchRecord> => {
  const existing = await getMatch(uid, matchId);
  if (!existing) throw new NotFoundError('Match not found.');

  const next: MatchRecord = {
    ...existing,
    status: input.status,
    winner: input.winner,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationSeconds: input.durationSeconds,
    finalPositions: input.finalPositions,
    turns: input.turns,
    rolls: input.rolls,
    bumps: input.bumps,
    lanesCompleted: input.lanesCompleted,
    ...(input.aiSummary !== undefined ? { aiSummary: input.aiSummary } : {}),
  };

  const db = await getFirestore();
  if (db) {
    await db.collection('matches').doc(matchId).set(next, { merge: true });
  } else {
    memoryMatches.set(matchId, next);
  }
  return next;
};

export const getMatch = async (uid: string, matchId: string): Promise<MatchRecord | null> => {
  const db = await getFirestore();
  if (db) {
    const snap = await db.collection('matches').doc(matchId).get();
    if (!snap.exists) return null;
    const data = snap.data() as MatchRecord;
    return data.userId === uid ? data : null;
  }
  const record = memoryMatches.get(matchId);
  return record && record.userId === uid ? record : null;
};

export const listMatches = async (uid: string, limit = 20): Promise<MatchRecord[]> => {
  const db = await getFirestore();
  if (db) {
    const snap = await db
      .collection('matches')
      .where('userId', '==', uid)
      .orderBy('endedAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d: { data: () => MatchRecord }) => d.data());
  }
  return [...memoryMatches.values()]
    .filter((m) => m.userId === uid)
    .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
    .slice(0, limit);
};
