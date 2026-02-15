'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tron-bg-primary px-4">
      <h1 className="font-heading text-4xl font-bold text-tron-red mb-4">
        System Error
      </h1>
      <p className="text-tron-text-secondary text-lg mb-8 text-center max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-tron-orange text-black font-heading text-sm tracking-wider rounded-lg shadow-tron-glow hover:shadow-tron-glow-strong transition-all"
      >
        Retry
      </button>
    </div>
  );
}
