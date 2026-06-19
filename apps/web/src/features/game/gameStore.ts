import { create } from 'zustand';
import {
  applyMove,
  createInitialGameState,
  decideAiMove,
  passTurn,
  rollDice,
  setRoll as engineSetRoll,
  validateAllocation,
  addLog,
} from '@aura-grid/game-engine';
import {
  type CharacterClassId,
  type GameMode,
  type GameState,
  type LaneIndex,
  type MoveAllocation,
} from '@aura-grid/shared';

export interface PlayerSetup {
  callsign: string;
  character: CharacterClassId;
  auraColor: string;
}

interface GameStore {
  game: GameState | null;
  allocation: MoveAllocation;
  lastBumps: number;
  newGame: (mode: GameMode, player: PlayerSetup, opponent: PlayerSetup) => void;
  rollForCurrent: () => void;
  adjustLane: (lane: LaneIndex, delta: number) => void;
  resetAllocation: () => void;
  executePlayerMove: () => { ok: boolean; reason?: string };
  passPlayer: () => void;
  runOpponentTurn: () => void;
  log: (msg: string, type: 'sys' | 'ai' | 'event' | 'move') => void;
  restart: () => void;
}

const allocationSum = (allocation: MoveAllocation): number =>
  Object.entries(allocation).reduce(
    (sum, [idx, count]) => sum + (Number(idx) + 1) * (count ?? 0),
    0,
  );

export { allocationSum };

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  allocation: {},
  lastBumps: 0,

  newGame: (mode, player, opponent) => {
    const game = createInitialGameState({
      mode,
      player: { callsign: player.callsign, character: player.character, auraColor: player.auraColor },
      opponent: {
        callsign: opponent.callsign,
        character: opponent.character,
        auraColor: opponent.auraColor,
      },
    });
    set({ game: engineSetRoll(game, rollDice()), allocation: {}, lastBumps: 0 });
  },

  rollForCurrent: () => {
    const { game } = get();
    if (!game || game.roll !== null) return;
    set({ game: engineSetRoll(game, rollDice()), allocation: {} });
  },

  adjustLane: (lane, delta) => {
    const { allocation } = get();
    const next = { ...allocation };
    const value = (next[lane] ?? 0) + delta;
    if (value <= 0) delete next[lane];
    else next[lane] = value;
    set({ allocation: next });
  },

  resetAllocation: () => set({ allocation: {} }),

  executePlayerMove: () => {
    const { game, allocation } = get();
    if (!game) return { ok: false, reason: 'No active game.' };
    const check = validateAllocation(game.player.positions, game.roll, allocation);
    if (!check.valid) return { ok: false, reason: check.reason };
    const result = applyMove(game, allocation);
    set({ game: result.state, allocation: {}, lastBumps: result.bumps });
    return { ok: true };
  },

  passPlayer: () => {
    const { game } = get();
    if (!game) return;
    set({ game: passTurn(game), allocation: {} });
  },

  // Opponent (AI) plays its full turn: roll, decide, apply or pass.
  runOpponentTurn: () => {
    let { game } = get();
    if (!game || game.turn !== 'opponent' || game.status !== 'PLAYING') return;

    game = engineSetRoll(game, rollDice());
    const decision = decideAiMove(game.opponent.positions, game.player.positions, game.roll!);

    if (!decision.move) {
      set({ game: passTurn(game) });
      return;
    }
    const result = applyMove(game, decision.move);
    set({ game: result.state, lastBumps: result.bumps });
  },

  log: (msg, type) => {
    const { game } = get();
    if (!game) return;
    set({ game: addLog(game, msg, type) });
  },

  restart: () => {
    const { game } = get();
    if (!game) return;
    get().newGame(
      game.mode,
      { callsign: game.player.callsign, character: game.player.character, auraColor: game.player.auraColor },
      {
        callsign: game.opponent.callsign,
        character: game.opponent.character,
        auraColor: game.opponent.auraColor,
      },
    );
  },
}));
