'use client';

export function TronDisc({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full animate-tron-spin"
        style={{
          border: '1px solid rgba(255, 106, 0, 0.15)',
          boxShadow: '0 0 20px rgba(255, 106, 0, 0.1), inset 0 0 20px rgba(255, 106, 0, 0.05)',
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '15%',
          border: '1px solid rgba(255, 106, 0, 0.12)',
          animation: 'spin 25s linear infinite reverse',
          boxShadow: '0 0 15px rgba(255, 106, 0, 0.08)',
        }}
      />
      {/* Inner ring */}
      <div
        className="absolute rounded-full animate-tron-spin"
        style={{
          inset: '30%',
          border: '1px solid rgba(255, 106, 0, 0.2)',
          boxShadow: '0 0 25px rgba(255, 106, 0, 0.15), inset 0 0 15px rgba(255, 106, 0, 0.08)',
        }}
      />
      {/* Center glow */}
      <div
        className="absolute rounded-full animate-tron-pulse"
        style={{
          inset: '42%',
          background: 'radial-gradient(circle, rgba(255, 106, 0, 0.15) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
