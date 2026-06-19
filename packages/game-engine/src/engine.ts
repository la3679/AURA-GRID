import {
  CHARACTER_CLASSES,
  LANE_CONFIG,
  type AppliedMoveResult,
  type CharacterClassId,
  type GameLog,
  type GameMode,
  type GameState,
  type LaneIndex,
  type LanePositions,
  type LogType,
  type MoveAllocation,
  type PlayerId,
  type PlayerState,
} from '@aura-grid/shared';
import { countCompletedLanes, createEmptyPositions, hasWon, isLaneComplete } from './rules.js';
import { validateAllocation } from './validation.js';

let logCounter = 0;
const makeLogId = (): string => `log-${Date.now()}-${(logCounter++).toString(36)}`;

export const createLog = (msg: string, type: LogType, at: string): GameLog => ({
  id: makeLogId(),
  msg,
  type,
  createdAt: at,
});

export interface CreatePlayerOptions {
  callsign?: string;
  character?: CharacterClassId;
  auraColor?: string;
}

const resolvePlayer = (id: PlayerId, opts: CreatePlayerOptions): PlayerState => {
  const character = opts.character ?? (id === 'player' ? 'TITAN' : 'WRAITH');
  const cls = CHARACTER_CLASSES.find((c) => c.id === character) ?? CHARACTER_CLASSES[0]!;
  return {
    id,
    callsign: opts.callsign ?? (id === 'player' ? 'USER' : 'EXO_ECHO'),
    character,
    auraColor: opts.auraColor ?? cls.defaultColor,
    positions: createEmptyPositions(),
  };
};

export interface CreateGameOptions {
  id?: string;
  mode?: GameMode;
  player?: CreatePlayerOptions;
  opponent?: CreatePlayerOptions;
  now?: () => string;
}

export const createInitialGameState = (options: CreateGameOptions = {}): GameState => {
  const now = options.now ?? (() => new Date().toISOString());
  const at = now();
  return {
    id: options.id ?? `match-${Date.now()}`,
    mode: options.mode ?? 'GUEST_VS_AI',
    status: 'PLAYING',
    turn: 'player',
    roll: null,
    player: resolvePlayer('player', options.player ?? {}),
    opponent: resolvePlayer('opponent', options.opponent ?? {}),
    winner: null,
    logs: [createLog('SYSTEM_INITIALIZED: NEURAL_LINK_STABLE', 'sys', at)],
    stats: {
      turns: 0,
      rolls: [],
      bumps: 0,
      perfectSplits: 0,
      lanesCompletedPlayer: 0,
      lanesCompletedOpponent: 0,
    },
    createdAt: at,
    updatedAt: at,
  };
};

export const setRoll = (state: GameState, roll: number): GameState => ({
  ...state,
  roll,
  stats: { ...state.stats, rolls: [...state.stats.rolls, roll] },
  updatedAt: state.updatedAt,
});

const otherPlayer = (id: PlayerId): PlayerId => (id === 'player' ? 'opponent' : 'player');

/**
 * Apply a validated move immutably. Advances the current player's markers, applies
 * bump rules (landing on opponent's exact position resets them to 0, unless that
 * position completes a lane — completed lanes are locked and cannot be bumped),
 * checks for a winner, records stats/logs, and passes the turn.
 */
export const applyMove = (
  state: GameState,
  allocation: MoveAllocation,
  now: () => string = () => new Date().toISOString(),
): AppliedMoveResult => {
  const positions =
    state.turn === 'player' ? state.player.positions : state.opponent.positions;
  const validation = validateAllocation(positions, state.roll, allocation);
  if (!validation.valid) {
    throw new Error(`Invalid move: ${validation.reason}`);
  }

  const isPlayerTurn = state.turn === 'player';
  const current = isPlayerTurn ? state.player : state.opponent;
  const opponent = isPlayerTurn ? state.opponent : state.player;

  const nextCurrent: LanePositions = [...current.positions] as LanePositions;
  const nextOpponent: LanePositions = [...opponent.positions] as LanePositions;

  let bumps = 0;
  const completedThisMove: LaneIndex[] = [];

  for (const [idxStr, count] of Object.entries(allocation)) {
    const lane = Number(idxStr) as LaneIndex;
    const config = LANE_CONFIG[lane]!;
    for (let i = 0; i < (count ?? 0); i++) {
      if (nextCurrent[lane] >= config.steps) break;
      nextCurrent[lane] += 1;

      const landedOnOpponent =
        nextCurrent[lane] === nextOpponent[lane] && nextCurrent[lane] < config.steps;
      if (landedOnOpponent) {
        nextOpponent[lane] = 0;
        bumps += 1;
      }
      if (nextCurrent[lane] === config.steps) completedThisMove.push(lane);
    }
  }

  const at = now();
  const distinctLanes = Object.keys(allocation).length;
  const isPerfectSplit = distinctLanes >= 2;

  const events: string[] = [];
  if (bumps > 0) events.push(`BUMP x${bumps}`);
  for (const lane of completedThisMove) events.push(`SYNC_L${lane + 1}`);
  const logMsg = `${current.callsign}: [${events.length ? events.join(', ') : 'MOVE_SYNC'}]`;

  const nextPlayer = isPlayerTurn
    ? { ...current, positions: nextCurrent }
    : { ...opponent, positions: nextOpponent };
  const nextOpp = isPlayerTurn
    ? { ...opponent, positions: nextOpponent }
    : { ...current, positions: nextCurrent };

  const currentWon = hasWon(nextCurrent);
  const winner: PlayerId | null = currentWon ? state.turn : null;

  const logs = [
    createLog(logMsg, 'move', at),
    ...(winner ? [createLog(`${current.callsign}: GRID_CONTROL_ACHIEVED`, 'event', at)] : []),
    ...state.logs,
  ].slice(0, 25);

  const nextState: GameState = {
    ...state,
    player: nextPlayer,
    opponent: nextOpp,
    roll: null,
    turn: winner ? state.turn : otherPlayer(state.turn),
    winner,
    status: winner ? 'VICTORY' : 'PLAYING',
    logs,
    stats: {
      ...state.stats,
      turns: state.stats.turns + 1,
      bumps: state.stats.bumps + bumps,
      perfectSplits: state.stats.perfectSplits + (isPerfectSplit ? 1 : 0),
      lanesCompletedPlayer: countCompletedLanes(nextPlayer.positions),
      lanesCompletedOpponent: countCompletedLanes(nextOpp.positions),
    },
    updatedAt: at,
  };

  return { state: nextState, bumps, completedLanes: completedThisMove, isPerfectSplit };
};

export const passTurn = (
  state: GameState,
  now: () => string = () => new Date().toISOString(),
): GameState => {
  const current = state.turn === 'player' ? state.player : state.opponent;
  const at = now();
  return {
    ...state,
    turn: otherPlayer(state.turn),
    roll: null,
    logs: [createLog(`${current.callsign}: PASS (NO_MOVE)`, 'sys', at), ...state.logs].slice(0, 25),
    updatedAt: at,
  };
};

export const checkWinner = (state: GameState): PlayerId | null => {
  if (hasWon(state.player.positions)) return 'player';
  if (hasWon(state.opponent.positions)) return 'opponent';
  return null;
};

export const getMatchStats = (state: GameState) => ({
  turns: state.stats.turns,
  rolls: state.stats.rolls,
  bumps: state.stats.bumps,
  perfectSplits: state.stats.perfectSplits,
  lanesCompleted:
    state.winner === 'player'
      ? state.stats.lanesCompletedPlayer
      : state.stats.lanesCompletedOpponent,
  durationSeconds: Math.max(
    0,
    Math.round((new Date(state.updatedAt).getTime() - new Date(state.createdAt).getTime()) / 1000),
  ),
});

export const addLog = (
  state: GameState,
  msg: string,
  type: LogType = 'sys',
  now: () => string = () => new Date().toISOString(),
): GameState => ({
  ...state,
  logs: [createLog(msg, type, now()), ...state.logs].slice(0, 25),
});

export const isLaneLocked = (positions: LanePositions, lane: LaneIndex): boolean =>
  isLaneComplete(positions, lane);
