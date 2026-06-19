import { useState } from 'react';
import type { MatchRecord } from '@aura-grid/shared';
import { Badge } from '@aura-grid/ui';
import { MatchDetailModal } from './MatchDetailModal.js';

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
};

export const MatchHistoryList = ({ matches }: { matches: MatchRecord[] }) => {
  const [selected, setSelected] = useState<MatchRecord | null>(null);
  return (
    <>
      <ul className="flex flex-col divide-y divide-[var(--border)]">
        {matches.map((m) => {
          const won = m.winner === 'PLAYER';
          return (
            <li key={m.id}>
              <button
                onClick={() => setSelected(m)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-[var(--muted)]/40"
              >
                <div className="flex items-center gap-3">
                  <Badge tone={won ? 'success' : 'danger'}>{won ? 'WIN' : 'LOSS'}</Badge>
                  <div>
                    <p className="text-sm font-medium">vs {m.opponentName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {m.turns} turns · {m.bumps} bumps · {m.lanesCompleted} lanes
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{formatDate(m.endedAt)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <MatchDetailModal match={selected} onClose={() => setSelected(null)} />
    </>
  );
};
