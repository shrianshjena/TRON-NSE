export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tron-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-tron-orange/20 border-t-tron-orange animate-spin"
          style={{ boxShadow: '0 0 15px rgba(255, 106, 0, 0.3)' }}
        />
        <span className="text-tron-text-secondary text-sm font-mono">
          Loading...
        </span>
      </div>
    </div>
  );
}
