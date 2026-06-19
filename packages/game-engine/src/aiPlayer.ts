import type { GameState, LanePositions, MoveAllocation } from '@aura-grid/shared';
import { getValidMoves } from './rules.js';
import { scoreMove } from './scoring.js';

export interface AiDecision {
  move: MoveAllocation | null;
  score: number;
}

/**
 * Deterministic AI move selection. Given fixed positions and roll, always returns
 * the same decision: the highest-scoring valid move, or null to pass when none exist.
 * Ties are broken by a stable serialization so behavior is reproducible in tests.
 */
export const decideAiMove = (
  self: LanePositions,
  opponent: LanePositions,
  roll: number,
): AiDecision => {
  const candidates = getValidMoves(self, roll);
  if (candidates.length === 0) return { move: null, score: 0 };

  let best: MoveAllocation = candidates[0]!;
  let bestScore = -Infinity;
  let bestKey = '';

  for (const candidate of candidates) {
    const score = scoreMove(self, opponent, candidate);
    const key = JSON.stringify(candidate);
    if (score > bestScore || (score === bestScore && key < bestKey)) {
      best = candidate;
      bestScore = score;
      bestKey = key;
    }
  }

  return { move: best, score: bestScore };
};

/** Convenience wrapper that reads the opponent (AI) view from a game state. */
export const createAiMove = (state: GameState): AiDecision => {
  if (state.roll === null) return { move: null, score: 0 };
  return decideAiMove(state.opponent.positions, state.player.positions, state.roll);
};
