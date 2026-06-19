import { cn } from './lib/cn.js';

export const Spinner = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn(
      'inline-block animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-transparent',
      className,
    )}
    style={{ width: size, height: size }}
  />
);
