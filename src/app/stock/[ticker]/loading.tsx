export default function StockLoading() {
  return (
    <div className="min-h-screen bg-tron-bg-primary">
      {/* Header skeleton */}
      <div className="border-b border-tron px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-8 w-32 bg-tron-bg-card rounded animate-pulse" />
          <div className="h-10 w-64 bg-tron-bg-card rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stock header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-tron-bg-card rounded mb-3 animate-pulse" />
          <div className="h-12 w-48 bg-tron-bg-card rounded mb-2 animate-pulse" />
          <div className="h-5 w-32 bg-tron-bg-card rounded animate-pulse" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-6 border-b border-tron mb-8">
          {['w-24', 'w-28', 'w-24', 'w-32'].map((w, i) => (
            <div key={i} className={`h-10 ${w} bg-tron-bg-card rounded animate-pulse`} />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-tron-bg-card rounded-lg animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-20 bg-tron-bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-tron-bg-card rounded-lg animate-pulse" />
            <div className="h-64 bg-tron-bg-card rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
