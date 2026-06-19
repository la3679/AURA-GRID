interface LogoProps {
  variant?: 'full' | 'icon' | 'navbar';
  className?: string;
}

/**
 * Original AURA-GRID mark: a hex grid with split lanes converging on an energy core.
 * Pure SVG (no external assets), themable via currentColor / CSS variables.
 */
export const AuraGridLogo = ({ variant = 'full', className }: LogoProps) => {
  const mark = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AURA-GRID"
      className={variant === 'icon' ? className : undefined}
      width={variant === 'navbar' ? 28 : 36}
      height={variant === 'navbar' ? 28 : 36}
    >
      <defs>
        <linearGradient id="aura-core" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      {/* Outer hex */}
      <path
        d="M24 3 42 13.5 42 34.5 24 45 6 34.5 6 13.5Z"
        stroke="url(#aura-core)"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Split lanes */}
      <path d="M24 45 24 24" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
      <path d="M6 13.5 24 24" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
      <path d="M42 13.5 24 24" stroke="var(--accent)" strokeWidth="2" opacity="0.5" />
      {/* Energy core */}
      <circle cx="24" cy="24" r="5" fill="url(#aura-core)" />
      <circle cx="24" cy="24" r="9" stroke="var(--primary)" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );

  if (variant === 'icon') return mark;

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      {mark}
      <span className="font-display font-bold tracking-tight">
        <span className="text-[var(--foreground)]">AURA</span>
        <span className="text-[var(--primary)]">-GRID</span>
      </span>
    </span>
  );
};
