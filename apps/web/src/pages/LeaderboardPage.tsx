import { Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@aura-grid/ui';
import { useAuth } from '../features/auth/useAuth.js';
import { useLeaderboardQuery } from '../features/dashboard/hooks.js';

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const { data, isLoading, isError } = useLeaderboardQuery();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Leaderboard" description="The top operatives on the Grid." />

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Leaderboard unavailable"
              description="The ranking service is temporarily offline."
            />
          ) : !data || data.length === 0 ? (
            <EmptyState
              title="No grid operators ranked yet."
              description="Win matches to claim the first spot."
              icon={<Trophy size={28} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Callsign</th>
                    <th className="py-2 pr-2 text-right">Lvl</th>
                    <th className="py-2 pr-2 text-right">XP</th>
                    <th className="py-2 pr-2 text-right">W</th>
                    <th className="py-2 pr-2 text-right">L</th>
                    <th className="py-2 pr-2 text-right">Win%</th>
                    <th className="py-2 text-right">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry, i) => {
                    const isMe = profile?.uid === entry.uid;
                    return (
                      <tr
                        key={entry.uid}
                        className={`border-b border-[var(--border)] ${
                          isMe ? 'bg-[var(--primary)]/10' : ''
                        }`}
                      >
                        <td className="py-2.5 pr-2 font-mono">{i + 1}</td>
                        <td className="py-2.5 pr-2 font-medium">
                          {entry.callsign}
                          {isMe && <span className="ml-2 text-xs text-[var(--primary)]">you</span>}
                        </td>
                        <td className="py-2.5 pr-2 text-right">{entry.level}</td>
                        <td className="py-2.5 pr-2 text-right tabular-nums">{entry.xp}</td>
                        <td className="py-2.5 pr-2 text-right">{entry.wins}</td>
                        <td className="py-2.5 pr-2 text-right">{entry.losses}</td>
                        <td className="py-2.5 pr-2 text-right">{entry.winRate}%</td>
                        <td className="py-2.5 text-right">{entry.bestStreak}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
