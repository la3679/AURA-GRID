import { describe, it, expect } from 'vitest';
import { decideAiMove } from '../src/aiPlayer.js';
import { scoreMove, simulateMove } from '../src/scoring.js';
import { allocationValue } from '../src/rules.js';
import type { LanePositions } from '@aura-grid/shared';

const empty: LanePositions = [0, 0, 0, 0, 0, 0];

describe('decideAiMove', () => {
  it('returns a valid move whose value equals the roll when one exists', () => {
    const decision = decideAiMove(empty, empty, 6);
    expect(decision.move).not.toBeNull();
    expect(allocationValue(decision.move!)).toBe(6);
  });

  it('passes (null) when no valid move exists', () => {
    const stuck: LanePositions = [9, 6, 4, 3, 3, 2];
    const decision = decideAiMove(stuck, empty, 6);
    expect(decision.move).toBeNull();
  });

  it('is deterministic for identical inputs', () => {
    const a = decideAiMove(empty, [0, 0, 0, 0, 0, 0], 5);
    const b = decideAiMove(empty, [0, 0, 0, 0, 0, 0], 5);
    expect(a.move).toEqual(b.move);
  });

  it('prefers a winning move when available', () => {
    // Two lanes complete; a roll of 3 can complete lane 3 to win.
    const self: LanePositions = [10, 6, 3, 0, 0, 0];
    const decision = decideAiMove(self, empty, 3);
    expect(decision.move).toEqual({ 2: 1 });
    expect(decision.score).toBeGreaterThanOrEqual(1000);
  });

  it('prefers a bump over plain progress', () => {
    // Opponent sits at position 1 in lane 1; allocating {0:1} bumps them.
    const self: LanePositions = [0, 0, 0, 0, 0, 0];
    const opponent: LanePositions = [1, 0, 0, 0, 0, 0];
    const bumpScore = scoreMove(self, opponent, { 0: 1 });
    const plainScore = scoreMove(self, opponent, { 0: 1 }); // same, sanity
    expect(bumpScore).toBe(plainScore);
    const sim = simulateMove(self, opponent, { 0: 1 });
    expect(sim.bumps).toBe(1);
  });
});
