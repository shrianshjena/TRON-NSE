'use client';

import React from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type GlowColor = 'orange' | 'green' | 'red' | 'cyan';
type GlowIntensity = 'subtle' | 'medium' | 'strong';

interface GlowBorderProps {
  children: React.ReactNode;
  color?: GlowColor;
  intensity?: GlowIntensity;
  animated?: boolean;
  className?: string;
}

const colorMap: Record<GlowColor, { r: number; g: number; b: number }> = {
  orange: { r: 255, g: 106, b: 0 },
  green: { r: 0, g: 230, b: 118 },
  red: { r: 255, g: 23, b: 68 },
  cyan: { r: 0, g: 229, b: 255 },
};

const intensityMap: Record<GlowIntensity, { borderAlpha: number; glowAlpha: number; spreadAlpha: number }> = {
  subtle: { borderAlpha: 0.15, glowAlpha: 0.1, spreadAlpha: 0.05 },
  medium: { borderAlpha: 0.3, glowAlpha: 0.2, spreadAlpha: 0.1 },
  strong: { borderAlpha: 0.5, glowAlpha: 0.35, spreadAlpha: 0.15 },
};

function GlowBorder({
  children,
  color = 'orange',
  intensity = 'medium',
  animated = false,
  className,
}: GlowBorderProps) {
  const { r, g, b } = colorMap[color];
  const { borderAlpha, glowAlpha, spreadAlpha } = intensityMap[intensity];

  const borderColor = `rgba(${r},${g},${b},${borderAlpha})`;
  const boxShadow = `0 0 10px rgba(${r},${g},${b},${glowAlpha}), 0 0 30px rgba(${r},${g},${b},${spreadAlpha})`;

  return (
    <div
      className={cn(
        'rounded-xl',
        animated && 'animate-glow-breathe',
        className
      )}
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow,
      }}
    >
      {children}
    </div>
  );
}

export { GlowBorder };
export type { GlowBorderProps, GlowColor };
