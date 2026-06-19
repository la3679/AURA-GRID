import { cn } from './lib/cn.js';

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  label?: string;
}

export const Progress = ({ value, max = 100, className, color, label }: ProgressProps) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color ?? 'var(--primary)' }}
      />
    </div>
  );
};
