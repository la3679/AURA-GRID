import { Link } from 'react-router-dom';
import { Gamepad2, LayoutDashboard, Trophy } from 'lucide-react';
import { Button, Card, CardContent, PageHeader } from '@aura-grid/ui';
import { useAuth } from '../features/auth/useAuth.js';

const steps = [
  { icon: Gamepad2, title: 'Play a match', body: 'Face EXO_ECHO and learn the split mechanic.' },
  { icon: Trophy, title: 'Climb the ranks', body: 'Win matches to earn XP and rise on the leaderboard.' },
  { icon: LayoutDashboard, title: 'Track your grid', body: 'Your dashboard surfaces stats and AI insights.' },
];

export default function OnboardingPage() {
  const { profile } = useAuth();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome, ${profile?.callsign ?? 'Operative'}`}
        description="Your neural link is synchronized. Here's how to own the Grid."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="flex flex-col gap-2 pt-5">
              <Icon className="text-[var(--primary)]" size={24} />
              <h3 className="font-display font-semibold">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-3">
        <Link to="/game">
          <Button>Start your first match</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
