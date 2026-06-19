import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AuraGridLogo } from '../branding/AuraGridLogo.js';
import { ThemeToggle } from '../../features/theme/ThemeToggle.js';

export const AuthLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <div className="aura-grid-bg flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
    <header className="flex items-center justify-between p-4">
      <Link to="/" aria-label="AURA-GRID home">
        <AuraGridLogo variant="navbar" />
      </Link>
      <ThemeToggle />
    </header>
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  </div>
);
