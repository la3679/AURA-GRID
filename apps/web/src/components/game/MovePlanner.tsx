import { Minus, Plus, RotateCcw } from 'lucide-react';
import { LANE_CONFIG, type GameState, type LaneIndex } from '@aura-grid/shared';
import { Badge, Button } from '@aura-grid/ui';
import { allocationSum, useGameStore } from '../../features/game/gameStore.js';
import { isLaneLocked } from '@aura-grid/game-engine';

export const MovePlanner = ({
  game,
  onExecute,
  onPass,
}: {
  game: GameState;
  onExecute: () => void;
  onPass: () => void;
}) => {
  const allocation = useGameStore((s) => s.allocation);
  const adjustLane = useGameStore((s) => s.adjustLane);
  const resetAllocation = useGameStore((s) => s.resetAllocation);

  const sum = allocationSum(allocation);
  const roll = game.roll ?? 0;
  const valid = sum === roll && roll > 0;
  const isPlayerTurn = game.turn === 'player' && game.status === 'PLAYING';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">Current roll</p>
          <p className="font-display text-3xl font-bold text-[var(--primary)]">{roll || '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--muted-foreground)]">Allocated</p>
          <p
            className={`font-display text-2xl font-bold tabular-nums ${
              sum === roll ? 'text-[var(--success)]' : 'text-[var(--foreground)]'
            }`}
          >
            {sum}/{roll}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {LANE_CONFIG.map((lane, i) => {
          const idx = i as LaneIndex;
          const count = allocation[idx] ?? 0;
          const locked = isLaneLocked(game.player.positions, idx);
          const canAdd =
            !locked &&
            sum + lane.cost <= roll &&
            game.player.positions[idx] + count < lane.steps;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border)] p-2"
            >
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                L{i + 1} ×{lane.cost}
              </span>
              <span className="font-display text-lg font-bold">{count}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustLane(idx, -1)}
                  disabled={!isPlayerTurn || count === 0}
                  aria-label={`Remove from lane ${i + 1}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] disabled:opacity-30"
                >
                  <Minus size={12} />
                </button>
                <button
                  onClick={() => adjustLane(idx, 1)}
                  disabled={!isPlayerTurn || !canAdd}
                  aria-label={`Add to lane ${i + 1}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] disabled:opacity-30"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={resetAllocation} disabled={!isPlayerTurn}>
          <RotateCcw size={14} /> Reset
        </Button>
        <div className="flex items-center gap-2">
          {!valid && isPlayerTurn && <Badge tone="warning">Allocate exactly {roll}</Badge>}
          <Button variant="outline" size="sm" onClick={onPass} disabled={!isPlayerTurn}>
            Pass
          </Button>
          <Button size="sm" onClick={onExecute} disabled={!isPlayerTurn || !valid}>
            Execute
          </Button>
        </div>
      </div>
    </div>
  );
};
