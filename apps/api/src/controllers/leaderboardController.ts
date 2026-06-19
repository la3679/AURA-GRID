import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import { getLeaderboard, syncEntry } from '../services/leaderboard/leaderboardService.js';

export const getLeaderboardController = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'public, max-age=30');
  const entries = await getLeaderboard();
  sendSuccess(res, entries);
};

export const postLeaderboardSync = async (_req: Request, res: Response): Promise<void> => {
  const entry = await syncEntry(res.locals.uid as string);
  sendSuccess(res, entry);
};
