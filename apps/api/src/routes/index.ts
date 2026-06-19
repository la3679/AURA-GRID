import { Router } from 'express';
import {
  commentaryRequestSchema,
  completeMatchSchema,
  createMatchSchema,
  matchSummaryRequestSchema,
  opponentPersonalityRequestSchema,
  strategyTipRequestSchema,
  updateProfileSchema,
} from '@aura-grid/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { getHealth, getVersion } from '../controllers/healthController.js';
import {
  createSession,
  getMe,
  getMyStats,
  updateMe,
} from '../controllers/userController.js';
import {
  getMatchById,
  getMatches,
  postMatch,
  putMatchComplete,
} from '../controllers/matchController.js';
import {
  getLeaderboardController,
  postLeaderboardSync,
} from '../controllers/leaderboardController.js';
import {
  postCommentary,
  postDailyChallenge,
  postMatchSummary,
  postOpponentPersonality,
  postStrategyTip,
} from '../controllers/aiController.js';

export const router = Router();

// Public
router.get('/health', getHealth);
router.get('/version', getVersion);
router.get('/leaderboard', asyncHandler(getLeaderboardController));

// Auth/session
router.post('/auth/session', requireAuth, asyncHandler(createSession));

// Users (protected)
router.get('/users/me', requireAuth, asyncHandler(getMe));
router.put('/users/me', requireAuth, validate(updateProfileSchema), asyncHandler(updateMe));
router.get('/users/me/stats', requireAuth, asyncHandler(getMyStats));

// Matches (protected)
router.post('/matches', requireAuth, validate(createMatchSchema), asyncHandler(postMatch));
router.get('/matches', requireAuth, asyncHandler(getMatches));
router.get('/matches/:id', requireAuth, asyncHandler(getMatchById));
router.put(
  '/matches/:id/complete',
  requireAuth,
  validate(completeMatchSchema),
  asyncHandler(putMatchComplete),
);

// Leaderboard (protected sync)
router.post('/leaderboard/sync', requireAuth, asyncHandler(postLeaderboardSync));

// AI (protected, rate-limited, validated, cached, fallback-safe)
router.post(
  '/ai/commentary',
  requireAuth,
  aiLimiter,
  validate(commentaryRequestSchema),
  asyncHandler(postCommentary),
);
router.post(
  '/ai/match-summary',
  requireAuth,
  aiLimiter,
  validate(matchSummaryRequestSchema),
  asyncHandler(postMatchSummary),
);
router.post(
  '/ai/strategy-tip',
  requireAuth,
  aiLimiter,
  validate(strategyTipRequestSchema),
  asyncHandler(postStrategyTip),
);
router.post(
  '/ai/opponent-personality',
  requireAuth,
  aiLimiter,
  validate(opponentPersonalityRequestSchema),
  asyncHandler(postOpponentPersonality),
);
router.post('/ai/daily-challenge', requireAuth, aiLimiter, asyncHandler(postDailyChallenge));
