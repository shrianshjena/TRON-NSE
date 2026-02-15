'use client';

import Link from 'next/link';

export default function StockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tron-bg-primary px-4">
      <h1 className="font-heading text-3xl font-bold text-tron-red mb-4">
        Failed to Load Stock Data
      </h1>
      <p className="text-tron-text-secondary text-lg mb-8 text-center max-w-md">
        {error.message || 'Could not retrieve data for this stock. Please try again.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-tron-orange text-black font-heading text-sm tracking-wider rounded-lg shadow-tron-glow hover:shadow-tron-glow-strong transition-all"
        >
          Retry
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-tron text-tron-text-primary font-heading text-sm tracking-wider rounded-lg hover:border-tron-orange/50 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
