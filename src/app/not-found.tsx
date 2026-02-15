import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tron-bg-primary px-4">
      <h1 className="font-heading text-6xl font-bold glow-text mb-4">404</h1>
      <p className="text-tron-text-secondary text-lg mb-8">
        Stock not found in the grid
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-tron-orange text-black font-heading text-sm tracking-wider rounded-lg shadow-tron-glow hover:shadow-tron-glow-strong transition-all"
      >
        Return to Command Center
      </Link>
    </div>
  );
}
