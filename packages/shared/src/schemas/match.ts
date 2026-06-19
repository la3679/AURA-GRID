import { z } from 'zod';
import { lanePositionsSchema } from './game.js';

export const createMatchSchema = z.object({
  opponentType: z.enum(['AI', 'LOCAL', 'ONLINE']),
  opponentName: z.string().min(1).max(40),
});

export const completeMatchSchema = z.object({
  status: z.enum(['COMPLETED', 'ABANDONED']),
  winner: z.enum(['PLAYER', 'OPPONENT']),
  startedAt: z.string(),
  endedAt: z.string(),
  durationSeconds: z.number().int().nonnegative(),
  finalPositions: z.object({
    player: lanePositionsSchema,
    opponent: lanePositionsSchema,
  }),
  turns: z.number().int().nonnegative(),
  rolls: z.array(z.number().int().min(1).max(6)),
  bumps: z.number().int().nonnegative(),
  lanesCompleted: z.number().int().min(0).max(6),
  aiSummary: z.string().optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type CompleteMatchInput = z.infer<typeof completeMatchSchema>;
