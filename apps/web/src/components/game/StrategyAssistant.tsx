import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import type { GameState, RiskLevel } from '@aura-grid/shared';
import { Badge, Button } from '@aura-grid/ui';
import { requestStrategyTip } from '../../features/ai/aiService.js';
import { useAuth } from '../../features/auth/useAuth.js';

const riskTone: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

const MAX_HINTS = 3;

export const StrategyAssistant = ({ game }: { game: GameState }) => {
  const { isAuthenticated } = useAuth();
  const [tip, setTip] = useState<{ text: string; risk: RiskLevel } | null>(null);
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0);

  const askForHint = async () => {
    if (game.roll === null || used >= MAX_HINTS) return;
    setLoading(true);
    try {
      const res = await requestStrategyTip({
        roll: game.roll,
        playerPositions: [...game.player.positions],
        opponentPositions: [...game.opponent.positions],
      });
      setTip({ text: res.bestMoveExplanation, risk: res.riskLevel });
      setUsed((u) => u + 1);
    } catch {
      setTip({
        text: 'Focus your roll on a lane that is one step from completion.',
        risk: 'MEDIUM',
      });
      setUsed((u) => u + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
          <Lightbulb size={16} className="text-[var(--warning)]" /> Strategy Assistant
        </h3>
        <span className="text-xs text-[var(--muted-foreground)]">
          {MAX_HINTS - used} hints left
        </span>
      </div>
      {tip ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm">{tip.text}</p>
          <Badge tone={riskTone[tip.risk]}>Risk: {tip.risk}</Badge>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)]">
          {isAuthenticated
            ? 'Ask the oracle for a tactical read on your current roll.'
            : 'Hints use a local fallback in guest mode.'}
        </p>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={askForHint}
        isLoading={loading}
        disabled={game.turn !== 'player' || game.roll === null || used >= MAX_HINTS}
      >
        Ask for Hint
      </Button>
    </div>
  );
};
