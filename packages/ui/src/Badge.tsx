import type { HTMLAttributes } from 'react';
import { cn } from './lib/cn.js';

type Tone = 'default' | 'success' | 'danger' | 'warning' | 'accent';

const tones: Record<Tone, string> = {
  default: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  success: 'bg-[var(--success)]/15 text-[var(--success)]',
  danger: 'bg-[var(--danger)]/15 text-[var(--danger)]',
  warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
  accent: 'bg-[var(--accent)]/15 text-[var(--accent)]',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export const Badge = ({ className, tone = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide',
      tones[tone],
      className,
    )}
    {...props}
  />
);
