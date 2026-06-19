import type { ReactNode } from 'react';
import { cn } from './lib/cn.js';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => (
  <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
