import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Bot,
  Boxes,
  Crosshair,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button, Card, CardContent } from '@aura-grid/ui';
import { PublicNavbar } from '../components/layout/PublicNavbar.js';
import { IntroLoader } from '../components/landing/IntroLoader.js';
import { HeroExplainerVideo } from '../components/landing/HeroExplainerVideo.js';
import { AuraGridLogo } from '../components/branding/AuraGridLogo.js';
import { useAuth } from '../features/auth/useAuth.js';
import { useAuthStore } from '../features/auth/authStore.js';

const features = [
  { icon: Layers, title: 'Six tactical lanes', body: 'Each lane has a unique cost and length. Plan your splits.' },
  { icon: Crosshair, title: 'Bump & purge', body: 'Land on a rival to reset their lane progress to zero.' },
  { icon: Trophy, title: 'Capture three to win', body: 'Complete any three lanes to shut down the grid.' },
  { icon: Bot, title: 'AI commentary', body: 'Gemini-powered cyberpunk narration of every key moment.' },
  { icon: Gauge, title: 'Stats & XP', body: 'Track win rate, streaks, bumps, and climb levels.' },
  { icon: ShieldCheck, title: 'Secure by design', body: 'AI runs only on the backend. No secrets in the browser.' },
];

const howItWorks = [
  { step: '01', title: 'Roll', body: 'A value from 1 to 6 is generated each turn.' },
  { step: '02', title: 'Split', body: 'Allocate the roll across lanes so it sums exactly.' },
  { step: '03', title: 'Advance', body: 'Move markers, trigger bumps, and complete lanes.' },
  { step: '04', title: 'Dominate', body: 'Control three lanes before your opponent does.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const startGuest = useAuthStore((s) => s.startGuest);

  const playAsGuest = () => {
    startGuest({ callsign: 'GUEST-OP', selectedClass: 'PRISM', auraColor: '#a855f7' });
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <IntroLoader />
      <PublicNavbar />

      {/* Hero */}
      <section className="aura-grid-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AuraGridLogo className="mb-6 text-2xl" />
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Split the signal. <span className="text-[var(--primary)]">Control the lanes.</span>
              </h1>
              <p className="mt-4 max-w-md text-[var(--muted-foreground)]">
                AURA-GRID is a futuristic strategy game where you partition every roll across six
                lanes, bump your rivals, and race to own the grid.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={isAuthenticated ? '/dashboard' : '/signup'}>
                  <Button size="lg">
                    <Sparkles size={18} /> Enter the Grid
                  </Button>
                </Link>
                <a href="#demo">
                  <Button size="lg" variant="outline">
                    Watch Demo
                  </Button>
                </a>
                <Button size="lg" variant="ghost" onClick={playAsGuest}>
                  Play as Guest
                </Button>
              </div>
            </motion.div>

            <motion.div
              id="demo"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <HeroExplainerVideo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Built for strategists</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Every system, rebuilt to feel deliberate.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="flex flex-col gap-2 pt-5">
                <Icon className="text-[var(--primary)]" size={24} />
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-[var(--border)] bg-[var(--card)]/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">How the game works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {howItWorks.map(({ step, title, body }) => (
              <div key={step} className="rounded-xl border border-[var(--border)] p-5">
                <span className="font-mono text-sm text-[var(--primary)]">{step}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + previews */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col gap-2 pt-5">
              <Bot className="text-[var(--accent)]" size={24} />
              <h3 className="font-display font-semibold">AI that respects the rules</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Gemini narrates and advises — but never moves for you. The engine stays
                deterministic and fully tested.
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col gap-2 pt-5">
              <Boxes className="text-[var(--primary)]" size={24} />
              <h3 className="font-display font-semibold">A real dashboard</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Win rate, streaks, recent matches, and AI insights — your command center.
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col gap-2 pt-5">
              <Trophy className="text-[var(--warning)]" size={24} />
              <h3 className="font-display font-semibold">Global leaderboard</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Rank by XP and win rate. Earn your place among grid operators.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <AuraGridLogo variant="navbar" />
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} AURA-GRID. Control 3 lanes. Own the Grid.
          </p>
        </div>
      </footer>
    </div>
  );
}
