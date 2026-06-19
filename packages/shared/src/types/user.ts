import type { CharacterClassId } from './game.js';

export type ThemePreference = 'dark' | 'light' | 'system';

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  lanesCaptured: number;
  bumpsTriggered: number;
  perfectSplits: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
  level: number;
}

export interface UserPreferences {
  theme: ThemePreference;
  reducedMotion: boolean;
  soundEnabled: boolean;
  commentaryEnabled: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  callsign: string;
  selectedClass: CharacterClassId;
  auraColor: string;
  createdAt: string;
  updatedAt: string;
  stats: PlayerStats;
  preferences: UserPreferences;
}

export type OpponentType = 'AI' | 'LOCAL' | 'ONLINE';
export type MatchStatus = 'COMPLETED' | 'ABANDONED';
export type MatchWinner = 'PLAYER' | 'OPPONENT';

export interface MatchRecord {
  id: string;
  userId: string;
  opponentType: OpponentType;
  opponentName: string;
  status: MatchStatus;
  winner: MatchWinner;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  finalPositions: {
    player: number[];
    opponent: number[];
  };
  turns: number;
  rolls: number[];
  bumps: number;
  lanesCompleted: number;
  aiSummary?: string;
}

export interface LeaderboardEntry {
  uid: string;
  callsign: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  winRate: number;
  bestStreak: number;
  updatedAt: string;
}
