import { useNavigate } from 'react-router-dom';
import type { GameState, MatchSummaryResponse } from '@aura-grid/shared';
import { Badge, Button, Modal, Spinner } from '@aura-grid/ui';

export const VictoryModal = ({
  game,
  summary,
  summaryLoading,
  onRematch,
}: {
  game: GameState;
  summary: MatchSummaryResponse | null;
  summaryLoading: boolean;
  onRematch: () => void;
}) => {
  const navigate = useNavigate();
  const playerWon = game.winner === 'player';

  return (
    <Modal open={game.status === 'VICTORY'} onClose={() => {}} closeOnBackdrop={false}>
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge tone={playerWon ? 'success' : 'danger'} className="text-sm">
          {playerWon ? 'GRID CONTROL ACHIEVED' : 'GRID LOST'}
        </Badge>
        <h2 className="font-display text-2xl font-bold">
          {playerWon ? `${game.player.callsign} wins` : `${game.opponent.callsign} wins`}
        </h2>

        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="font-display text-lg font-bold">{game.stats.turns}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Turns</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="font-display text-lg font-bold">{game.stats.bumps}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Bumps</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="font-display text-lg font-bold">{game.stats.perfectSplits}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Splits</p>
          </div>
        </div>

        <div className="min-h-[60px] w-full rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-left">
          <p className="text-xs font-semibold text-[var(--accent)]">AI Summary</p>
          {summaryLoading ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Spinner size={14} /> Generating debrief…
            </div>
          ) : summary ? (
            <div className="mt-1">
              <p className="text-sm">{summary.summary}</p>
              {summary.improvementTips.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-xs text-[var(--muted-foreground)]">
                  {summary.improvementTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              AI debrief is offline. Match recorded.
            </p>
          )}
        </div>

        <div className="flex w-full gap-2">
          <Button className="flex-1" onClick={onRematch}>
            Rematch
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  );
};
