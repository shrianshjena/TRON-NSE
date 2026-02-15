'use client';

import React, { forwardRef, useState, useCallback } from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

interface RippleState {
  x: number;
  y: number;
  id: number;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-tron-orange text-white hover:bg-tron-orange-light shadow-tron-glow hover:shadow-tron-glow-strong',
  secondary:
    'bg-transparent border border-tron-orange/30 text-tron-orange hover:border-tron-orange/60 hover:bg-tron-orange/5',
  ghost:
    'bg-transparent text-tron-text-secondary hover:text-tron-text-primary hover:bg-white/5',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-base rounded-lg gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, onClick, disabled, ...props }, ref) => {
    const [ripples, setRipples] = useState<RippleState[]>([]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);

        onClick?.(e);
      },
      [onClick, disabled]
    );

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-medium overflow-hidden',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-tron-orange/40 focus:ring-offset-2 focus:ring-offset-tron-bg-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.97]',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
              background:
                variant === 'primary'
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,106,0,0.3)',
            }}
          />
        ))}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
