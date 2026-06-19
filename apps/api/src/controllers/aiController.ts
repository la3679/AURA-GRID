import type { Request, Response } from 'express';
import type {
  CommentaryRequest,
  MatchSummaryRequest,
  OpponentPersonalityRequest,
  StrategyTipRequest,
} from '@aura-grid/shared';
import { sendSuccess } from '../utils/response.js';
import {
  getCommentary,
  getMatchSummary,
  getOpponentPersonality,
  getStrategyTip,
} from '../services/gemini/aiService.js';

const noPublicCache = (res: Response): void => {
  res.setHeader('Cache-Control', 'private, no-store');
};

export const postCommentary = async (req: Request, res: Response): Promise<void> => {
  noPublicCache(res);
  const result = await getCommentary(req.body as CommentaryRequest);
  sendSuccess(res, result, { cached: result.cached });
};

export const postMatchSummary = async (req: Request, res: Response): Promise<void> => {
  noPublicCache(res);
  const result = await getMatchSummary(req.body as MatchSummaryRequest);
  sendSuccess(res, result, { cached: result.cached });
};

export const postStrategyTip = async (req: Request, res: Response): Promise<void> => {
  noPublicCache(res);
  const result = await getStrategyTip(req.body as StrategyTipRequest);
  sendSuccess(res, result, { cached: result.cached });
};

export const postOpponentPersonality = async (req: Request, res: Response): Promise<void> => {
  noPublicCache(res);
  const result = await getOpponentPersonality(req.body as OpponentPersonalityRequest);
  sendSuccess(res, result, { cached: result.cached });
};

export const postDailyChallenge = async (_req: Request, res: Response): Promise<void> => {
  noPublicCache(res);
  // Deterministic daily seed; AI flavor is optional and additive.
  const day = new Date().toISOString().slice(0, 10);
  sendSuccess(res, {
    date: day,
    title: 'Daily Directive',
    objective: 'Win a match triggering at least 3 bumps.',
    reward: '150 XP',
  });
};
