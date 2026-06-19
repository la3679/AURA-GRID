import type { ReactNode } from 'react';
import { cn } from './lib/cn.js';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  className?: string;
}

export const StatCard = ({ label, value, icon, hint, className }: StatCardProps) => (
  <div
    className={cn(
      'rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--card-foreground)]',
      className,
    )}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </span>
      {icon && <span className="text-[var(--primary)]">{icon}</span>}
    </div>
    <div className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</div>
    {hint && <div className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</div>}
  </div>
);
