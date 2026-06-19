import {
  DICE_MAX,
  DICE_MIN,
  LANE_CONFIG,
  LANE_COUNT,
  LANES_TO_WIN,
  type LaneIndex,
  type LanePositions,
  type MoveAllocation,
} from '@aura-grid/shared';

export { LANE_CONFIG, LANE_COUNT, LANES_TO_WIN } from '@aura-grid/shared';

/** Injectable RNG so dice rolls are deterministic in tests. Defaults to Math.random. */
export type RandomFn = () => number;

export const rollDice = (rng: RandomFn = Math.random): number =>
  DICE_MIN + Math.floor(rng() * (DICE_MAX - DICE_MIN + 1));

export const isLaneComplete = (positions: LanePositions, lane: LaneIndex): boolean =>
  positions[lane] >= LANE_CONFIG[lane]!.steps;

export const getCompletedLanes = (positions: LanePositions): LaneIndex[] => {
  const lanes: LaneIndex[] = [];
  for (let i = 0; i < LANE_COUNT; i++) {
    if (isLaneComplete(positions, i as LaneIndex)) lanes.push(i as LaneIndex);
  }
  return lanes;
};

export const countCompletedLanes = (positions: LanePositions): number =>
  getCompletedLanes(positions).length;

export const hasWon = (positions: LanePositions): boolean =>
  countCompletedLanes(positions) >= LANES_TO_WIN;

/** Total value an allocation consumes from the roll: sum of (laneCost * count). */
export const allocationValue = (allocation: MoveAllocation): number => {
  let total = 0;
  for (const [idxStr, count] of Object.entries(allocation)) {
    const idx = Number(idxStr) as LaneIndex;
    total += LANE_CONFIG[idx]!.cost * (count ?? 0);
  }
  return total;
};

export const createEmptyPositions = (): LanePositions => [0, 0, 0, 0, 0, 0];

/**
 * Enumerate every valid allocation that sums exactly to `roll`, never exceeding a
 * lane's remaining steps and never moving in a completed lane.
 */
export const getValidMoves = (positions: LanePositions, roll: number): MoveAllocation[] => {
  const results: MoveAllocation[] = [];

  const remainingSteps = (lane: LaneIndex): number =>
    isLaneComplete(positions, lane) ? 0 : LANE_CONFIG[lane]!.steps - positions[lane];

  const recurse = (lane: number, budget: number, current: MoveAllocation): void => {
    if (budget === 0) {
      if (Object.keys(current).length > 0) results.push({ ...current });
      return;
    }
    if (lane >= LANE_COUNT) return;

    const laneIdx = lane as LaneIndex;
    const cost = LANE_CONFIG[laneIdx]!.cost;
    const maxByBudget = Math.floor(budget / cost);
    const maxByLane = remainingSteps(laneIdx);
    const maxCount = Math.min(maxByBudget, maxByLane);

    // Try every count for this lane (including 0 = skip).
    for (let count = maxCount; count >= 0; count--) {
      const next: MoveAllocation = { ...current };
      if (count > 0) next[laneIdx] = count;
      recurse(lane + 1, budget - cost * count, next);
    }
  };

  recurse(0, roll, {});
  return results;
};

export const hasAnyValidMove = (positions: LanePositions, roll: number): boolean =>
  getValidMoves(positions, roll).length > 0;
