import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialGameState, setRoll } from '@aura-grid/game-engine';
import { MovePlanner } from '../src/components/game/MovePlanner.js';
import { useGameStore } from '../src/features/game/gameStore.js';

const seedGame = () => {
  const game = setRoll(
    createInitialGameState({ id: 't', now: () => '2026-01-01T00:00:00.000Z' }),
    6,
  );
  useGameStore.setState({ game, allocation: {}, lastBumps: 0 });
  return game;
};

describe('MovePlanner', () => {
  beforeEach(() => useGameStore.setState({ allocation: {} }));

  it('disables Execute until the allocation equals the roll', async () => {
    const game = seedGame();
    const onExecute = vi.fn();
    render(<MovePlanner game={game} onExecute={onExecute} onPass={() => {}} />);

    const execute = screen.getByRole('button', { name: /execute/i });
    expect(execute).toBeDisabled();

    // Allocate lane 6 (cost 6) once -> sum equals roll 6.
    await userEvent.click(screen.getByRole('button', { name: /add to lane 6/i }));
    expect(execute).toBeEnabled();

    await userEvent.click(execute);
    expect(onExecute).toHaveBeenCalledOnce();
  });
});
