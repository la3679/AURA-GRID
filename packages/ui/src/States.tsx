import type { ReactNode } from 'react';
import { cn } from './lib/cn.js';

export interface StateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, icon, action, className }: StateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border)] p-10 text-center',
      className,
    )}
  >
    {icon && <div className="text-[var(--muted-foreground)]">{icon}</div>}
    <div>
      <p className="font-display text-base font-semibold">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export const ErrorState = ({
  title = 'Something went wrong',
  description,
  icon,
  action,
  className,
}: Partial<StateProps>) => (
  <div
    role="alert"
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/5 p-10 text-center',
      className,
    )}
  >
    {icon && <div className="text-[var(--danger)]">{icon}</div>}
    <div>
      <p className="font-display text-base font-semibold text-[var(--danger)]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
    </div>
    {action}
  </div>
);
