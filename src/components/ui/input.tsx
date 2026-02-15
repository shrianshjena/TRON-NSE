'use client';

import React, { forwardRef, useState } from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-tron-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div
          className="relative"
          style={{
            transition: 'transform 0.2s ease-out',
            transform: focused ? 'scaleX(1.01)' : 'scaleX(1)',
          }}
        >
          <input
            ref={ref}
            className={cn(
              'w-full bg-tron-bg-card text-tron-text-primary placeholder-tron-text-secondary/50',
              'border rounded-lg px-4 py-2.5 text-sm',
              'outline-none transition-all duration-200',
              focused
                ? 'border-tron-orange/50'
                : error
                  ? 'border-tron-red/50'
                  : 'border-tron-orange/15',
              className
            )}
            style={{
              boxShadow: focused
                ? '0 0 12px rgba(255,106,0,0.2), 0 0 4px rgba(255,106,0,0.1)'
                : error
                  ? '0 0 8px rgba(255,23,68,0.15)'
                  : 'none',
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-tron-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
