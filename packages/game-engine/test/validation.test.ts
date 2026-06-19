import { describe, it, expect } from 'vitest';
import { validateAllocation } from '../src/validation.js';
import type { LanePositions } from '@aura-grid/shared';

const empty: LanePositions = [0, 0, 0, 0, 0, 0];

describe('validateAllocation', () => {
  it('rejects when there is no active roll', () => {
    const result = validateAllocation(empty, null, { 0: 1 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/no active roll/i);
  });

  it('rejects an empty allocation', () => {
    const result = validateAllocation(empty, 3, {});
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/empty/i);
  });

  it('accepts a move whose value equals the roll', () => {
    expect(validateAllocation(empty, 6, { 5: 1 }).valid).toBe(true);
    expect(validateAllocation(empty, 6, { 0: 6 }).valid).toBe(true);
    expect(validateAllocation(empty, 6, { 3: 1, 1: 1 }).valid).toBe(true);
  });

  it('rejects a move over the roll', () => {
    const result = validateAllocation(empty, 4, { 5: 1 }); // value 6 > roll 4
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/must equal the roll/i);
  });

  it('rejects a move under the roll', () => {
    const result = validateAllocation(empty, 6, { 0: 1 }); // value 1 < roll 6
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/must equal the roll/i);
  });

  it('rejects moving past a lane maximum', () => {
    const nearTop: LanePositions = [0, 0, 0, 0, 0, 1];
    const result = validateAllocation(nearTop, 12, { 5: 2 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/maximum steps/i);
  });

  it('rejects moving in a completed (locked) lane', () => {
    const lane1Done: LanePositions = [10, 0, 0, 0, 0, 0];
    const result = validateAllocation(lane1Done, 1, { 0: 1 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/locked/i);
  });

  it('rejects a non-existent lane', () => {
    const result = validateAllocation(empty, 1, { 9: 1 } as never);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/does not exist/i);
  });

  it('rejects a non-positive count', () => {
    const result = validateAllocation(empty, 1, { 0: 0 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/positive integer/i);
  });
});
