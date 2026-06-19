import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Gamepad2, LayoutDashboard, LogOut, Menu, Trophy, User, X } from 'lucide-react';
import { Avatar, Button } from '@aura-grid/ui';
import { AuraGridLogo } from '../branding/AuraGridLogo.js';
import { ThemeToggle } from '../../features/theme/ThemeToggle.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { logout } from '../../features/auth/authService.js';
import { useAuthStore } from '../../features/auth/authStore.js';
import { toast } from '../../features/toast/toastStore.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/game', label: 'Play', icon: Gamepad2 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { profile, isGuest } = useAuth();
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const clearGuest = useAuthStore((s) => s.clearGuest);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    clearGuest();
    reset();
    toast.info('Disconnected from the Grid.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" aria-label="Dashboard">
            <AuraGridLogo variant="navbar" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--muted)] text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile && (
              <div className="hidden items-center gap-2 md:flex">
                <Avatar name={profile.callsign} color={profile.auraColor} size={32} />
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-[var(--border)] px-4 py-3 md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)]"
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/settings"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                Settings
              </NavLink>
              <Button variant="outline" className="mt-2" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </nav>
        )}
      </header>

      {isGuest && (
        <div className="bg-[var(--accent)]/10 px-4 py-2 text-center text-xs text-[var(--accent)]">
          Playing as guest — progress is not saved.{' '}
          <Link to="/signup" className="underline">
            Create an account
          </Link>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
};
