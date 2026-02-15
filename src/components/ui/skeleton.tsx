import React from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SkeletonProps {
  className?: string;
  /** Width of the skeleton (e.g. "100%", "200px") */
  width?: string;
  /** Height of the skeleton (e.g. "20px", "1rem") */
  height?: string;
  /** Use rounded-full for circle/avatar shapes */
  rounded?: boolean;
}

function Skeleton({ className, width, height, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-tron-bg-card animate-skeleton-pulse',
        rounded ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{ width, height }}
    />
  );
}

/** Skeleton shaped like a card with header, body lines, and footer. */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-tron-bg-card rounded-xl border border-tron-orange/10 p-5 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" rounded />
        <div className="space-y-2 flex-1">
          <Skeleton height="14px" width="60%" />
          <Skeleton height="10px" width="40%" />
        </div>
      </div>
      {/* Body lines */}
      <div className="space-y-2">
        <Skeleton height="12px" width="100%" />
        <Skeleton height="12px" width="90%" />
        <Skeleton height="12px" width="75%" />
      </div>
      {/* Footer */}
      <div className="flex gap-2">
        <Skeleton height="28px" width="80px" />
        <Skeleton height="28px" width="60px" />
      </div>
    </div>
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="12px"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonText };
export type { SkeletonProps };
