'use client';

import { useState, lazy, Suspense } from 'react';

const OverviewTab = lazy(() => import('./overview/overview-tab'));
const FinancialsTab = lazy(() => import('./financials/financials-tab'));
const EarningsTab = lazy(() => import('./earnings/earnings-tab'));
const HistoricalTab = lazy(() => import('./historical/historical-tab'));

const TABS = [
  { id: 'overview', label: 'Overview', Component: OverviewTab },
  { id: 'financials', label: 'Financials', Component: FinancialsTab },
  { id: 'earnings', label: 'Earnings', Component: EarningsTab },
  { id: 'historical', label: 'Historical Data', Component: HistoricalTab },
] as const;

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse py-6">
      <div className="h-48 bg-tron-bg-card rounded-lg" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-tron-bg-card rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function TabContainer({ ticker }: { ticker: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const active = TABS.find((t) => t.id === activeTab)!;
  const ActiveComponent = active.Component;

  return (
    <div>
      {/* Tab navigation */}
      <nav className="flex gap-1 border-b border-tron overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-sm font-heading tracking-wider whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-tron-orange'
                : 'text-tron-text-secondary hover:text-tron-text-primary'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-tron-orange rounded-full"
                style={{
                  boxShadow: '0 0 8px rgba(255,106,0,0.6), 0 0 16px rgba(255,106,0,0.3)',
                }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="py-6 animate-fade-in" key={activeTab}>
        <Suspense fallback={<TabSkeleton />}>
          <ActiveComponent ticker={ticker} />
        </Suspense>
      </div>
    </div>
  );
}
