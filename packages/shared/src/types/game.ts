export type PlayerId = 'player' | 'opponent';
export type GameStatus = 'LOBBY' | 'PLAYING' | 'VICTORY' | 'ABANDONED';
export type LaneIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** A move allocation maps lane index -> number of steps taken in that lane this turn. */
export type MoveAllocation = Partial<Record<LaneIndex, number>>;

export type CharacterClassId = 'TITAN' | 'WRAITH' | 'PRISM' | 'ORACLE' | 'VOID';
export type MarkerShape = 'square' | 'diamond' | 'triangle' | 'circle' | 'hex';

export interface CharacterClass {
  id: CharacterClassId;
  name: string;
  description: string;
  defaultColor: string;
  markerShape: MarkerShape;
}

export type GameMode = 'GUEST_VS_AI' | 'USER_VS_AI' | 'LOCAL_2P';

export type LogType = 'sys' | 'ai' | 'event' | 'move';

export interface GameLog {
  id: string;
  msg: string;
  type: LogType;
  createdAt: string;
}

export type LanePositions = [number, number, number, number, number, number];

export interface PlayerState {
  id: PlayerId;
  callsign: string;
  character: CharacterClassId;
  auraColor: string;
  positions: LanePositions;
}

export interface MatchStats {
  turns: number;
  rolls: number[];
  bumps: number;
  perfectSplits: number;
  lanesCompletedPlayer: number;
  lanesCompletedOpponent: number;
}

export interface GameState {
  id: string;
  mode: GameMode;
  status: GameStatus;
  turn: PlayerId;
  roll: number | null;
  player: PlayerState;
  opponent: PlayerState;
  winner: PlayerId | null;
  logs: GameLog[];
  stats: MatchStats;
  createdAt: string;
  updatedAt: string;
}

export interface MoveValidationResult {
  valid: boolean;
  reason?: string;
}

export interface AppliedMoveResult {
  state: GameState;
  bumps: number;
  completedLanes: LaneIndex[];
  isPerfectSplit: boolean;
}
