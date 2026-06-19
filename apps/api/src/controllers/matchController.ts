import type { Request, Response } from 'express';
import type { CompleteMatchInput, CreateMatchInput } from '@aura-grid/shared';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';
import {
  completeMatch,
  createMatch,
  getMatch,
  listMatches,
} from '../services/matches/matchService.js';
import { applyMatchToStats } from '../services/users/userService.js';
import { syncEntry } from '../services/leaderboard/leaderboardService.js';

const uidOf = (res: Response): string => res.locals.uid as string;

export const postMatch = async (req: Request, res: Response): Promise<void> => {
  const match = await createMatch(uidOf(res), req.body as CreateMatchInput);
  sendSuccess(res, match, { status: 201 });
};

export const getMatches = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');
  const matches = await listMatches(uidOf(res));
  sendSuccess(res, matches);
};

export const getMatchById = async (req: Request, res: Response): Promise<void> => {
  const match = await getMatch(uidOf(res), req.params.id as string);
  if (!match) throw new NotFoundError('Match not found.');
  sendSuccess(res, match);
};

export const putMatchComplete = async (req: Request, res: Response): Promise<void> => {
  const uid = uidOf(res);
  const input = req.body as CompleteMatchInput;
  const match = await completeMatch(uid, req.params.id as string, input);

  // Update aggregate stats and leaderboard from the verified outcome.
  const stats = await applyMatchToStats(uid, {
    won: input.winner === 'PLAYER',
    lanesCaptured: input.lanesCompleted,
    bumps: input.bumps,
    perfectSplits: 0,
  });
  await syncEntry(uid);

  sendSuccess(res, { match, stats });
};
