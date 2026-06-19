import {
  LANE_CONFIG,
  LANE_COUNT,
  type GameState,
  type LaneIndex,
  type LanePositions,
  type MoveAllocation,
  type MoveValidationResult,
} from '@aura-grid/shared';
import { allocationValue, isLaneComplete } from './rules.js';

/**
 * Validate a move against a set of positions and the active roll.
 * Returns a structured result with a human-readable reason on failure —
 * never silently returns false.
 */
export const validateAllocation = (
  positions: LanePositions,
  roll: number | null,
  allocation: MoveAllocation,
): MoveValidationResult => {
  if (roll === null) {
    return { valid: false, reason: 'No active roll.' };
  }

  const entries = Object.entries(allocation);
  if (entries.length === 0) {
    return { valid: false, reason: 'Allocation cannot be empty.' };
  }

  for (const [idxStr, count] of entries) {
    const idx = Number(idxStr);
    if (!Number.isInteger(idx) || idx < 0 || idx >= LANE_COUNT) {
      return { valid: false, reason: `Lane ${idxStr} does not exist.` };
    }
    if (count === undefined || !Number.isInteger(count) || count <= 0) {
      return { valid: false, reason: `Lane ${idx + 1} count must be a positive integer.` };
    }
    const laneIdx = idx as LaneIndex;
    if (isLaneComplete(positions, laneIdx)) {
      return { valid: false, reason: `Lane ${idx + 1} is already complete and locked.` };
    }
    if (positions[laneIdx] + count > LANE_CONFIG[laneIdx]!.steps) {
      return { valid: false, reason: `Lane ${idx + 1} cannot exceed its maximum steps.` };
    }
  }

  const value = allocationValue(allocation);
  if (value !== roll) {
    return {
      valid: false,
      reason: `Allocation value (${value}) must equal the roll (${roll}).`,
    };
  }

  return { valid: true };
};

/** Validate a move against the current player's positions in a game state. */
export const validateMove = (
  state: GameState,
  allocation: MoveAllocation,
): MoveValidationResult => {
  const positions = state.turn === 'player' ? state.player.positions : state.opponent.positions;
  return validateAllocation(positions, state.roll, allocation);
};
