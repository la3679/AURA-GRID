import { memo } from 'react';
import { LANE_CONFIG, type LaneIndex, type PlayerState } from '@aura-grid/shared';
import { Check } from 'lucide-react';

interface LaneProps {
  lane: LaneIndex;
  player: PlayerState;
  opponent: PlayerState;
  planned: number;
}

const Lane = memo(({ lane, player, opponent, planned }: LaneProps) => {
  const config = LANE_CONFIG[lane]!;
  const playerPos = player.positions[lane];
  const opponentPos = opponent.positions[lane];
  const complete = playerPos >= config.steps;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
        <span className="font-mono">L{lane + 1}</span>
        <span className="rounded bg-[var(--muted)] px-1">×{config.cost}</span>
      </div>
      <div className="relative flex flex-col-reverse gap-1" role="list" aria-label={`Lane ${lane + 1}`}>
        {Array.from({ length: config.steps }).map((_, step) => {
          const stepNum = step + 1;
          const hasPlayer = playerPos === stepNum;
          const hasOpponent = opponentPos === stepNum;
          const plannedReach = playerPos + planned >= stepNum && stepNum > playerPos;
          return (
            <div
              key={step}
              role="listitem"
              className={`flex h-6 w-8 items-center justify-center rounded border text-[10px] transition-colors md:w-10 ${
                plannedReach
                  ? 'border-[var(--primary)] bg-[var(--primary)]/20'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              {hasPlayer && (
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: player.auraColor }}
                  aria-label={`${player.callsign} marker`}
                />
              )}
              {hasOpponent && !hasPlayer && (
                <span
                  className="h-3 w-3 rotate-45"
                  style={{ backgroundColor: opponent.auraColor }}
                  aria-label={`${opponent.callsign} marker`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div
        className={`flex h-5 items-center text-[10px] ${
          complete ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'
        }`}
      >
        {complete ? (
          <span className="inline-flex items-center gap-0.5">
            <Check size={12} /> SYNC
          </span>
        ) : (
          `${playerPos}/${config.steps}`
        )}
      </div>
    </div>
  );
});
Lane.displayName = 'Lane';

export const GameBoard = ({
  player,
  opponent,
  allocation,
}: {
  player: PlayerState;
  opponent: PlayerState;
  allocation: Partial<Record<LaneIndex, number>>;
}) => (
  <div className="flex justify-center gap-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 md:gap-4">
    {LANE_CONFIG.map((_, i) => (
      <Lane
        key={i}
        lane={i as LaneIndex}
        player={player}
        opponent={opponent}
        planned={allocation[i as LaneIndex] ?? 0}
      />
    ))}
  </div>
);
