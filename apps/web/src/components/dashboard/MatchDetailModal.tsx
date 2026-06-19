import type { MatchRecord } from '@aura-grid/shared';
import { LANE_CONFIG } from '@aura-grid/shared';
import { Badge, Modal, Progress } from '@aura-grid/ui';

const LaneRow = ({ label, positions, color }: { label: string; positions: number[]; color: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
    <div className="grid grid-cols-6 gap-1">
      {LANE_CONFIG.map((lane, i) => (
        <Progress key={i} value={positions[i] ?? 0} max={lane.steps} color={color} className="h-1.5" />
      ))}
    </div>
  </div>
);

export const MatchDetailModal = ({
  match,
  onClose,
}: {
  match: MatchRecord | null;
  onClose: () => void;
}) => {
  if (!match) return null;
  const won = match.winner === 'PLAYER';
  return (
    <Modal open={!!match} onClose={onClose} title={`Match vs ${match.opponentName}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge tone={won ? 'success' : 'danger'}>{won ? 'VICTORY' : 'DEFEAT'}</Badge>
          <span className="text-sm text-[var(--muted-foreground)]">
            {match.turns} turns · {match.durationSeconds}s
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="font-display text-lg font-bold">{match.bumps}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Bumps</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="font-display text-lg font-bold">{match.lanesCompleted}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Lanes</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="font-display text-lg font-bold">{match.rolls.length}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Rolls</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <LaneRow label="Your final board" positions={match.finalPositions.player} color="var(--primary)" />
          <LaneRow label="Opponent" positions={match.finalPositions.opponent} color="var(--accent)" />
        </div>

        {match.aiSummary && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3">
            <p className="text-xs font-semibold text-[var(--accent)]">AI Summary</p>
            <p className="mt-1 text-sm">{match.aiSummary}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
