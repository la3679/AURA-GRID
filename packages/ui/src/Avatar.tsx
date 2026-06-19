import { cn } from './lib/cn.js';

export interface AvatarProps {
  name: string;
  src?: string;
  color?: string;
  size?: number;
  className?: string;
}

export const Avatar = ({ name, src, color, size = 40, className }: AvatarProps) => {
  const initials = name
    .split(/[\s_-]+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-semibold text-[var(--primary-foreground)]',
        className,
      )}
      style={{ width: size, height: size, backgroundColor: color ?? 'var(--primary)' }}
      aria-hidden={src ? 'true' : undefined}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      )}
    </div>
  );
};
