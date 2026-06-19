import {
  LANE_CONFIG,
  type LaneIndex,
  type LanePositions,
  type MoveAllocation,
} from '@aura-grid/shared';
import { countCompletedLanes, isLaneComplete } from './rules.js';

/**
 * Simulate the outcome of an allocation on a pair of positions without mutating them.
 * Mirrors applyMove's stepping/bump logic so the AI can score candidate moves.
 */
export interface SimulatedMove {
  nextSelf: LanePositions;
  nextOpponent: LanePositions;
  bumps: number;
  progress: number;
  lanesCompleted: number;
}

export const simulateMove = (
  self: LanePositions,
  opponent: LanePositions,
  allocation: MoveAllocation,
): SimulatedMove => {
  const nextSelf: LanePositions = [...self] as LanePositions;
  const nextOpponent: LanePositions = [...opponent] as LanePositions;
  let bumps = 0;
  let progress = 0;

  for (const [idxStr, count] of Object.entries(allocation)) {
    const lane = Number(idxStr) as LaneIndex;
    const config = LANE_CONFIG[lane]!;
    for (let i = 0; i < (count ?? 0); i++) {
      if (nextSelf[lane] >= config.steps) break;
      nextSelf[lane] += 1;
      progress += 1;
      if (nextSelf[lane] === nextOpponent[lane] && nextSelf[lane] < config.steps) {
        nextOpponent[lane] = 0;
        bumps += 1;
      }
    }
  }

  return {
    nextSelf,
    nextOpponent,
    bumps,
    progress,
    lanesCompleted: countCompletedLanes(nextSelf),
  };
};

/**
 * Score a candidate move. Higher is better.
 *  +1000 winning move
 *  +200  completes a lane
 *  +100  per bump
 *  +10   per progress step
 */
export const scoreMove = (
  self: LanePositions,
  opponent: LanePositions,
  allocation: MoveAllocation,
): number => {
  const before = countCompletedLanes(self);
  const sim = simulateMove(self, opponent, allocation);
  const lanesGained = sim.lanesCompleted - before;

  let score = 0;
  if (sim.lanesCompleted >= 3) score += 1000;
  score += lanesGained * 200;
  score += sim.bumps * 100;
  score += sim.progress * 10;

  // Slight preference for advancing lanes that are close to completion.
  for (let lane = 0; lane < LANE_CONFIG.length; lane++) {
    const idx = lane as LaneIndex;
    if (!isLaneComplete(sim.nextSelf, idx)) {
      const remaining = LANE_CONFIG[idx]!.steps - sim.nextSelf[idx];
      if (remaining === 1) score += 15;
    }
  }

  return score;
};
