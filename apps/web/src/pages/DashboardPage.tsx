import { Link } from 'react-router-dom';
import {
  Activity,
  Crosshair,
  Flame,
  Gamepad2,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
} from '@aura-grid/ui';
import { useAuth } from '../features/auth/useAuth.js';
import { useMatchesQuery, useStatsQuery } from '../features/dashboard/hooks.js';
import { MatchHistoryList } from '../components/dashboard/MatchHistoryList.js';

export default function DashboardPage() {
  const { profile, isGuest } = useAuth();
  const stats = useStatsQuery();
  const matches = useMatchesQuery();

  const s = isGuest ? profile?.stats : stats.data;
  const xpInLevel = s ? s.xp % 500 : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Operative ${profile?.callsign ?? ''}`}
        description="Your command center on the Grid."
        actions={
          <Link to="/game">
            <Button>
              <Gamepad2 size={16} /> Start AI Match
            </Button>
          </Link>
        }
      />

      {/* Level / XP */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl font-display text-xl font-bold text-[var(--primary-foreground)]"
              style={{ backgroundColor: profile?.auraColor ?? 'var(--primary)' }}
            >
              {s?.level ?? 1}
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Level</p>
              <p className="font-display text-lg font-semibold">
                {s?.level ?? 1} · {s?.xp ?? 0} XP
              </p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="mb-1 flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>Progress to next level</span>
              <span>{xpInLevel}/500 XP</span>
            </div>
            <Progress value={xpInLevel} max={500} color={profile?.auraColor} />
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      {stats.isLoading && !isGuest ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Wins" value={s?.wins ?? 0} icon={<Trophy size={16} />} />
          <StatCard label="Win Rate" value={`${s?.winRate ?? 0}%`} icon={<Target size={16} />} />
          <StatCard
            label="Current Streak"
            value={s?.currentStreak ?? 0}
            icon={<Flame size={16} />}
            hint={`Best: ${s?.bestStreak ?? 0}`}
          />
          <StatCard
            label="Lanes Captured"
            value={s?.lanesCaptured ?? 0}
            icon={<Zap size={16} />}
          />
          <StatCard label="Games Played" value={s?.gamesPlayed ?? 0} icon={<Activity size={16} />} />
          <StatCard label="Losses" value={s?.losses ?? 0} icon={<Activity size={16} />} />
          <StatCard
            label="Bumps Triggered"
            value={s?.bumpsTriggered ?? 0}
            icon={<Crosshair size={16} />}
          />
          <StatCard
            label="Perfect Splits"
            value={s?.perfectSplits ?? 0}
            icon={<Sparkles size={16} />}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent matches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {isGuest ? (
                <EmptyState
                  title="Guest mode"
                  description="Sign up to save match history and track your progress."
                  action={
                    <Link to="/signup">
                      <Button size="sm">Create account</Button>
                    </Link>
                  }
                />
              ) : matches.isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : matches.data && matches.data.length > 0 ? (
                <MatchHistoryList matches={matches.data.slice(0, 5)} />
              ) : (
                <EmptyState
                  title="No matches yet"
                  description="Play your first match to populate your history."
                  action={
                    <Link to="/game">
                      <Button size="sm">Play now</Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI insight + daily challenge */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent)]" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">
                {(s?.gamesPlayed ?? 0) === 0
                  ? 'Play a few matches and the oracle will analyze your playstyle.'
                  : (s?.winRate ?? 0) >= 50
                    ? 'Your aggression is paying off. Keep pressuring lanes near completion.'
                    : 'Tighten your splits — prioritize finishing lanes over spreading thin.'}
              </p>
              <Badge tone="accent" className="mt-3">
                Powered by Gemini (fallback active)
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Directive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Win a match triggering 3+ bumps.</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Reward: 150 XP</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
