export * from './lanes.js';
export * from './classes.js';

export const APP_NAME = 'AURA-GRID';

export const AI_FALLBACK_PHRASES: readonly string[] = [
  'Grid event recorded. No oracle response.',
  'Signal noise detected. Commentary suppressed.',
  'The Grid remains silent.',
  'Move accepted. Consequence pending.',
];

export const DEFAULT_PLAYER_STATS = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  lanesCaptured: 0,
  bumpsTriggered: 0,
  perfectSplits: 0,
  currentStreak: 0,
  bestStreak: 0,
  xp: 0,
  level: 1,
} as const;

export const DEFAULT_PREFERENCES = {
  theme: 'system',
  reducedMotion: false,
  soundEnabled: false,
  commentaryEnabled: true,
} as const;
