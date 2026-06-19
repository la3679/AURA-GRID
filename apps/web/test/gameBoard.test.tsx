import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createInitialGameState } from '@aura-grid/game-engine';
import { GameBoard } from '../src/components/game/GameBoard.js';

describe('GameBoard', () => {
  it('renders all six lanes', () => {
    const game = createInitialGameState({ id: 't', now: () => '2026-01-01T00:00:00.000Z' });
    render(<GameBoard player={game.player} opponent={game.opponent} allocation={{}} />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`L${i}`)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('list')).toHaveLength(6);
  });
});
