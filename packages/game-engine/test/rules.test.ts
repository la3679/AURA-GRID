import { describe, it, expect } from 'vitest';
import { LANE_CONFIG } from '@aura-grid/shared';
import {
  allocationValue,
  countCompletedLanes,
  getValidMoves,
  hasAnyValidMove,
  hasWon,
  isLaneComplete,
  rollDice,
} from '../src/rules.js';
import type { LanePositions } from '@aura-grid/shared';

describe('rollDice', () => {
  it('returns a value between 1 and 6 for any RNG output', () => {
    for (const r of [0, 0.16, 0.5, 0.83, 0.999]) {
      const value = rollDice(() => r);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it('is deterministic with an injected RNG', () => {
    expect(rollDice(() => 0)).toBe(1);
    expect(rollDice(() => 0.999)).toBe(6);
  });
});

describe('lane completion', () => {
  it('detects completed lanes against the canonical config', () => {
    const positions: LanePositions = [10, 0, 0, 0, 0, 0];
    expect(isLaneComplete(positions, 0)).toBe(true);
    expect(isLaneComplete(positions, 1)).toBe(false);
    expect(countCompletedLanes(positions)).toBe(1);
  });

  it('wins only after three completed lanes', () => {
    expect(hasWon([10, 6, 0, 0, 0, 0])).toBe(false);
    expect(hasWon([10, 6, 4, 0, 0, 0])).toBe(true);
  });
});

describe('allocationValue', () => {
  it('computes lane cost * count', () => {
    expect(allocationValue({ 0: 6 })).toBe(6); // lane1 cost 1 x6
    expect(allocationValue({ 5: 1 })).toBe(6); // lane6 cost 6 x1
    expect(allocationValue({ 3: 1, 1: 1 })).toBe(6); // 4 + 2
  });
});

describe('getValidMoves', () => {
  const empty: LanePositions = [0, 0, 0, 0, 0, 0];

  it('every valid move sums exactly to the roll', () => {
    for (const move of getValidMoves(empty, 6)) {
      expect(allocationValue(move)).toBe(6);
    }
  });

  it('includes multiple distinct split combinations for a roll of 6', () => {
    const moves = getValidMoves(empty, 6);
    expect(moves.length).toBeGreaterThan(3);
    // e.g. {5:1}=L6x1, {0:6}=L1x6, {3:1,1:1}=L4+L2
    expect(moves).toContainEqual({ 5: 1 });
    expect(moves).toContainEqual({ 0: 6 });
  });

  it('never proposes moves past a lane maximum', () => {
    const nearTop: LanePositions = [0, 0, 0, 0, 0, 1]; // lane6 has 2 steps, at 1
    for (const move of getValidMoves(nearTop, 6)) {
      if (move[5]) expect(nearTop[5] + move[5]).toBeLessThanOrEqual(LANE_CONFIG[5]!.steps);
    }
  });

  it('excludes completed (locked) lanes from moves', () => {
    const lane1Done: LanePositions = [10, 0, 0, 0, 0, 0];
    for (const move of getValidMoves(lane1Done, 1)) {
      expect(move[0]).toBeUndefined();
    }
  });

  it('reports no valid move when the roll cannot be placed', () => {
    // All lanes full except lane1 has 1 step left, roll of 6 cannot be exactly placed
    const stuck: LanePositions = [9, 6, 4, 3, 3, 2];
    expect(hasAnyValidMove(stuck, 6)).toBe(false);
  });
});
