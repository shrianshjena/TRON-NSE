'use client';

import React from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type GlowIntensity = 'subtle' | 'medium' | 'strong';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  glowIntensity?: GlowIntensity;
}

const glowStyles: Record<GlowIntensity, { border: string; shadow: string; hoverShadow: string }> = {
  subtle: {
    border: 'border-tron-orange/10',
    shadow: '0 0 8px rgba(255,106,0,0.05)',
    hoverShadow: '0 0 15px rgba(255,106,0,0.15), 0 0 30px rgba(255,106,0,0.05)',
  },
  medium: {
    border: 'border-tron-orange/15',
    shadow: '0 0 10px rgba(255,106,0,0.1), 0 0 20px rgba(255,106,0,0.05)',
    hoverShadow: '0 0 15px rgba(255,106,0,0.25), 0 0 40px rgba(255,106,0,0.1)',
  },
  strong: {
    border: 'border-tron-orange/25',
    shadow: '0 0 10px rgba(255,106,0,0.2), 0 0 30px rgba(255,106,0,0.1)',
    hoverShadow: '0 0 20px rgba(255,106,0,0.4), 0 0 50px rgba(255,106,0,0.15)',
  },
};

function Card({ className, children, glowIntensity = 'subtle' }: CardProps) {
  const glow = glowStyles[glowIntensity];

  return (
    <div
      className={cn(
        'bg-tron-bg-card rounded-xl border p-5',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5',
        glow.border,
        className
      )}
      style={{ boxShadow: glow.shadow }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = glow.hoverShadow;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = glow.shadow;
      }}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps, GlowIntensity };
