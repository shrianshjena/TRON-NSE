import React from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type BadgeVariant = 'bullish' | 'bearish' | 'neutral' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  bullish: 'bg-tron-green/10 text-tron-green border-tron-green/20',
  bearish: 'bg-tron-red/10 text-tron-red border-tron-red/20',
  neutral: 'bg-tron-orange/10 text-tron-orange border-tron-orange/20',
  default: 'bg-white/5 text-tron-text-secondary border-white/10',
};

const glowMap: Record<BadgeVariant, string> = {
  bullish: '0 0 6px rgba(0,230,118,0.25)',
  bearish: '0 0 6px rgba(255,23,68,0.25)',
  neutral: '0 0 6px rgba(255,106,0,0.25)',
  default: 'none',
};

function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        'whitespace-nowrap',
        variantStyles[variant],
        className
      )}
      style={{ boxShadow: glowMap[variant] }}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
