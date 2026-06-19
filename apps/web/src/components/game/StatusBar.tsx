import type { GameState } from '@aura-grid/shared';
import { Badge } from '@aura-grid/ui';

export const StatusBar = ({ game, elapsed }: { game: GameState; elapsed: number }) => {
  const mins = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  const playerTurn = game.turn === 'player';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center gap-3">
        <Badge tone={playerTurn ? 'accent' : 'default'}>
          {playerTurn ? game.player.callsign : game.opponent.callsign}'s turn
        </Badge>
        <span className="font-mono text-sm text-[var(--muted-foreground)]">Turn {game.stats.turns + 1}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm tabular-nums">
          {mins}:{secs}
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: game.player.auraColor }} />
            {game.player.callsign}
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rotate-45"
              style={{ backgroundColor: game.opponent.auraColor }}
            />
            {game.opponent.callsign}
          </span>
        </div>
      </div>
    </div>
  );
};
