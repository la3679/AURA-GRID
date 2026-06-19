import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Gamepad2 } from 'lucide-react';
import type { MatchSummaryResponse } from '@aura-grid/shared';
import { Button, Card, CardContent, PageHeader } from '@aura-grid/ui';
import { useAuth } from '../features/auth/useAuth.js';
import { useGameStore } from '../features/game/gameStore.js';
import { useSettingsStore } from '../features/settings/settingsStore.js';
import { requestCommentary, requestMatchSummary } from '../features/ai/aiService.js';
import { createMatch, completeMatch } from '../features/matches/matchService.js';
import { queryKeys } from '../lib/queryClient.js';
import { StatusBar } from '../components/game/StatusBar.js';
import { GameBoard } from '../components/game/GameBoard.js';
import { MovePlanner } from '../components/game/MovePlanner.js';
import { CommentaryPanel } from '../components/game/CommentaryPanel.js';
import { StrategyAssistant } from '../components/game/StrategyAssistant.js';
import { VictoryModal } from '../components/game/VictoryModal.js';
import { toast } from '../features/toast/toastStore.js';

export default function GamePage() {
  const { profile, isAuthenticated, isGuest } = useAuth();
  const qc = useQueryClient();
  const commentaryEnabled = useSettingsStore((s) => s.commentaryEnabled);

  const game = useGameStore((s) => s.game);
  const allocation = useGameStore((s) => s.allocation);
  const lastBumps = useGameStore((s) => s.lastBumps);
  const { newGame, rollForCurrent, runOpponentTurn, executePlayerMove, passPlayer, restart, log } =
    useGameStore();

  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState<MatchSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const startRef = useRef<number>(Date.now());
  const persistedRef = useRef(false);
  const prevBumpsRef = useRef(0);

  const startMatch = () => {
    if (!profile) return;
    newGame(
      isGuest ? 'GUEST_VS_AI' : 'USER_VS_AI',
      { callsign: profile.callsign, character: profile.selectedClass, auraColor: profile.auraColor },
      { callsign: 'EXO_ECHO', character: 'WRAITH', auraColor: '#f27d26' },
    );
    startRef.current = Date.now();
    persistedRef.current = false;
    prevBumpsRef.current = 0;
    setSummary(null);
    setElapsed(0);
  };

  // Match timer.
  useEffect(() => {
    if (!game || game.status !== 'PLAYING') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [game?.status, game]);

  // Ensure the active player always has a roll.
  useEffect(() => {
    if (game && game.status === 'PLAYING' && game.turn === 'player' && game.roll === null) {
      rollForCurrent();
    }
  }, [game, rollForCurrent]);

  // Drive the AI opponent's turn.
  useEffect(() => {
    if (!game || game.status !== 'PLAYING' || game.turn !== 'opponent') return;
    const t = setTimeout(() => runOpponentTurn(), 900);
    return () => clearTimeout(t);
  }, [game, runOpponentTurn]);

  // Commentary on meaningful events (bumps). Debounced via bump delta tracking.
  useEffect(() => {
    if (!game || !commentaryEnabled) return;
    if (lastBumps > 0 && lastBumps !== prevBumpsRef.current) {
      prevBumpsRef.current = lastBumps;
      void requestCommentary({
        event: `${lastBumps} bump(s) triggered`,
        player: {
          callsign: game.player.callsign,
          character: game.player.character,
          positions: [...game.player.positions],
        },
        opponent: {
          callsign: game.opponent.callsign,
          character: game.opponent.character,
          positions: [...game.opponent.positions],
        },
        tone: 'sarcastic',
      }).then((res) => log(res.commentary, 'ai'));
    }
  }, [lastBumps, game, commentaryEnabled, log]);

  // On victory: persist match (authenticated) and fetch AI summary.
  useEffect(() => {
    if (!game || game.status !== 'VICTORY' || persistedRef.current) return;
    persistedRef.current = true;

    const won = game.winner === 'player';
    const lanesCompleted = won
      ? game.stats.lanesCompletedPlayer
      : game.stats.lanesCompletedOpponent;
    const summaryReq = {
      match: {
        winner: (won ? 'PLAYER' : 'OPPONENT') as 'PLAYER' | 'OPPONENT',
        turns: game.stats.turns,
        bumps: game.stats.bumps,
        lanesCompleted,
        durationSeconds: elapsed,
        rolls: game.stats.rolls,
        finalPositions: {
          player: [...game.player.positions],
          opponent: [...game.opponent.positions],
        },
      },
    };

    setSummaryLoading(true);
    (async () => {
      let aiSummary: string | undefined;
      try {
        const res = await requestMatchSummary(summaryReq);
        setSummary(res);
        aiSummary = res.summary;
      } catch {
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }

      if (isAuthenticated) {
        try {
          const created = await createMatch({ opponentType: 'AI', opponentName: 'EXO_ECHO' });
          await completeMatch(created.id, {
            status: 'COMPLETED',
            winner: won ? 'PLAYER' : 'OPPONENT',
            startedAt: new Date(startRef.current).toISOString(),
            endedAt: new Date().toISOString(),
            durationSeconds: elapsed,
            finalPositions: summaryReq.match.finalPositions,
            turns: game.stats.turns,
            rolls: game.stats.rolls,
            bumps: game.stats.bumps,
            lanesCompleted,
            ...(aiSummary ? { aiSummary } : {}),
          });
          qc.invalidateQueries({ queryKey: queryKeys.matches });
          qc.invalidateQueries({ queryKey: queryKeys.stats });
          qc.invalidateQueries({ queryKey: queryKeys.leaderboard });
          toast.success('Match saved to your record.');
        } catch {
          toast.error('Could not save match. Stats unchanged.');
        }
      }
    })();
  }, [game, elapsed, isAuthenticated, qc]);

  const handleExecute = () => {
    const result = executePlayerMove();
    if (!result.ok && result.reason) toast.error(result.reason);
  };

  if (!game) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="New Match" description="Face the EXO_ECHO neural opponent." />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <Gamepad2 size={40} className="text-[var(--primary)]" />
            <div>
              <p className="font-display text-lg font-semibold">
                {profile?.callsign} vs EXO_ECHO
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Class: {profile?.selectedClass}. First to complete 3 lanes wins.
              </p>
            </div>
            <Button size="lg" onClick={startMatch}>
              Initialize Match
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <StatusBar game={game} elapsed={elapsed} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <GameBoard player={game.player} opponent={game.opponent} allocation={allocation} />
          <MovePlanner game={game} onExecute={handleExecute} onPass={passPlayer} />
        </div>
        <div className="flex flex-col gap-4">
          <StrategyAssistant game={game} />
          <CommentaryPanel logs={game.logs} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={restart}>
          Restart
        </Button>
      </div>

      <VictoryModal
        game={game}
        summary={summary}
        summaryLoading={summaryLoading}
        onRematch={restart}
      />
    </div>
  );
}
