import { z } from 'zod';
import { characterClassIdSchema, lanePositionsSchema } from './game.js';

const aiPlayerSchema = z.object({
  callsign: z.string().min(1).max(40),
  character: characterClassIdSchema,
  positions: lanePositionsSchema,
});

export const commentaryRequestSchema = z.object({
  matchId: z.string().optional(),
  event: z.string().min(1).max(80),
  player: aiPlayerSchema,
  opponent: aiPlayerSchema,
  tone: z.enum(['cinematic', 'sarcastic', 'coach', 'villain']).optional(),
});

export const matchSummaryRequestSchema = z.object({
  match: z.object({
    winner: z.enum(['PLAYER', 'OPPONENT']),
    turns: z.number().int().nonnegative(),
    bumps: z.number().int().nonnegative(),
    lanesCompleted: z.number().int().min(0).max(6),
    durationSeconds: z.number().int().nonnegative(),
    rolls: z.array(z.number().int().min(1).max(6)),
    finalPositions: z.object({
      player: lanePositionsSchema,
      opponent: lanePositionsSchema,
    }),
  }),
});

export const strategyTipRequestSchema = z.object({
  roll: z.number().int().min(1).max(6),
  playerPositions: lanePositionsSchema,
  opponentPositions: lanePositionsSchema,
  availableMoves: z.array(z.record(z.string(), z.number())).optional(),
});

export const opponentPersonalityRequestSchema = z.object({
  character: characterClassIdSchema,
  callsign: z.string().min(1).max(40),
});

export type CommentaryRequest = z.infer<typeof commentaryRequestSchema>;
export type MatchSummaryRequest = z.infer<typeof matchSummaryRequestSchema>;
export type StrategyTipRequest = z.infer<typeof strategyTipRequestSchema>;
export type OpponentPersonalityRequest = z.infer<typeof opponentPersonalityRequestSchema>;
