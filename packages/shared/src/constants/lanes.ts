export interface LaneConfig {
  /** Activation cost: value that must be allocated from the roll to advance one step. */
  cost: number;
  /** Number of steps required to fully synchronize (complete) the lane. */
  steps: number;
}

/**
 * Canonical AURA-GRID lane architecture (preserved from the original game design).
 * Lane index i has activation cost (i + 1).
 */
export const LANE_CONFIG: readonly LaneConfig[] = [
  { cost: 1, steps: 10 },
  { cost: 2, steps: 6 },
  { cost: 3, steps: 4 },
  { cost: 4, steps: 3 },
  { cost: 5, steps: 3 },
  { cost: 6, steps: 2 },
] as const;

export const LANE_COUNT = LANE_CONFIG.length;
export const LANES_TO_WIN = 3;
export const DICE_MIN = 1;
export const DICE_MAX = 6;
