'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'bg-tron-bg-card rounded-xl border border-tron-red/20 p-5',
        'flex flex-col items-center gap-3 text-center',
        className
      )}
      style={{
        boxShadow: '0 0 12px rgba(255,23,68,0.1), 0 0 30px rgba(255,23,68,0.05)',
      }}
    >
      {/* Error icon */}
      <div className="w-10 h-10 rounded-full bg-tron-red/10 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-5 h-5 text-tron-red"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <p className="text-sm text-tron-text-primary">{message}</p>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export { ErrorMessage };
export type { ErrorMessageProps };
