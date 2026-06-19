import { describe, it, expect } from 'vitest';
import {
  applyMove,
  checkWinner,
  createInitialGameState,
  passTurn,
  setRoll,
} from '../src/engine.js';
import type { GameState } from '@aura-grid/shared';

const fixedNow = () => '2026-01-01T00:00:00.000Z';

const newGame = (): GameState =>
  createInitialGameState({ id: 'test', now: fixedNow });

describe('createInitialGameState', () => {
  it('produces a valid initial state', () => {
    const s = newGame();
    expect(s.status).toBe('PLAYING');
    expect(s.turn).toBe('player');
    expect(s.roll).toBeNull();
    expect(s.player.positions).toEqual([0, 0, 0, 0, 0, 0]);
    expect(s.opponent.positions).toEqual([0, 0, 0, 0, 0, 0]);
    expect(s.winner).toBeNull();
  });
});

describe('applyMove', () => {
  it('does not mutate the previous state (immutable)', () => {
    const s = setRoll(newGame(), 6);
    const { state: next } = applyMove(s, { 5: 1 }, fixedNow);
    expect(s.player.positions).toEqual([0, 0, 0, 0, 0, 0]);
    expect(next.player.positions[5]).toBe(1);
    expect(next.turn).toBe('opponent');
    expect(next.roll).toBeNull();
  });

  it('throws on an invalid move rather than silently ignoring it', () => {
    const s = setRoll(newGame(), 6);
    expect(() => applyMove(s, { 0: 1 }, fixedNow)).toThrow(/invalid move/i);
  });

  it('bumps the opponent when landing on their exact position', () => {
    let s = newGame();
    // Place opponent at position 1 in lane 1 (index 0).
    s = { ...s, opponent: { ...s.opponent, positions: [1, 0, 0, 0, 0, 0] } };
    s = setRoll(s, 1);
    const { state: next, bumps } = applyMove(s, { 0: 1 }, fixedNow);
    expect(bumps).toBe(1);
    expect(next.opponent.positions[0]).toBe(0);
    expect(next.player.positions[0]).toBe(1);
  });

  it('does not bump a completed (locked) opponent lane', () => {
    let s = newGame();
    // Opponent has completed lane 6 (2 steps). Player advancing to step 2 completes it
    // too but must not reset the opponent's locked lane.
    s = {
      ...s,
      opponent: { ...s.opponent, positions: [0, 0, 0, 0, 0, 2] },
      player: { ...s.player, positions: [0, 0, 0, 0, 0, 1] },
    };
    s = setRoll(s, 6);
    const { state: next, bumps } = applyMove(s, { 5: 1 }, fixedNow);
    expect(bumps).toBe(0);
    expect(next.opponent.positions[5]).toBe(2);
  });

  it('counts a multi-lane allocation as a perfect split', () => {
    const s = setRoll(newGame(), 6);
    const { isPerfectSplit, state } = applyMove(s, { 3: 1, 1: 1 }, fixedNow);
    expect(isPerfectSplit).toBe(true);
    expect(state.stats.perfectSplits).toBe(1);
  });

  it('declares victory after completing three lanes', () => {
    let s = newGame();
    // Two lanes already complete; one move away from the third.
    s = {
      ...s,
      player: { ...s.player, positions: [10, 6, 3, 0, 0, 0] },
    };
    s = setRoll(s, 3);
    const { state: next } = applyMove(s, { 2: 1 }, fixedNow); // complete lane 3
    expect(next.winner).toBe('player');
    expect(next.status).toBe('VICTORY');
    expect(next.turn).toBe('player');
  });

  it('does not declare victory before three completed lanes', () => {
    let s = newGame();
    s = { ...s, player: { ...s.player, positions: [10, 5, 0, 0, 0, 0] } };
    s = setRoll(s, 2);
    const { state: next } = applyMove(s, { 1: 1 }, fixedNow); // completes lane 2 (2nd lane)
    expect(next.winner).toBeNull();
    expect(next.status).toBe('PLAYING');
  });
});

describe('passTurn', () => {
  it('passes the turn and clears the roll', () => {
    const s = setRoll(newGame(), 6);
    const next = passTurn(s, fixedNow);
    expect(next.turn).toBe('opponent');
    expect(next.roll).toBeNull();
  });
});

describe('checkWinner', () => {
  it('returns the winning player or null', () => {
    const s = newGame();
    expect(checkWinner(s)).toBeNull();
    const won = { ...s, player: { ...s.player, positions: [10, 6, 4, 0, 0, 0] } } as GameState;
    expect(checkWinner(won)).toBe('player');
  });
});
