'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStockData } from '@/hooks/use-stock-data';
import { StockHeader } from './stock-header';
import { AIScoreCard } from './ai-score-card';
import { TabContainer } from './tab-container';

export function StockPageClient({ ticker }: { ticker: string }) {
  const { data: overview, loading, error } = useStockData<any>(
    `/api/stock/${ticker}/overview`
  );

  return (
    <div className="min-h-screen bg-tron-bg-primary">
      {/* Navigation header */}
      <header className="sticky top-0 z-50 border-b border-tron bg-tron-bg-primary/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading text-xl font-bold glow-text tracking-wider"
          >
            TRON NSE
          </Link>
          <div className="text-sm text-tron-text-secondary font-mono">
            NSE: {ticker}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="p-6 rounded-lg bg-tron-bg-card border border-tron-red/30 text-center">
            <p className="text-tron-red mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-tron-orange text-black rounded-lg text-sm font-heading"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <>
            <StockHeader
              ticker={ticker}
              data={overview}
              loading={loading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
              {/* Main content - tabs */}
              <div className="lg:col-span-3">
                <TabContainer ticker={ticker} />
              </div>

              {/* Sidebar - AI Score */}
              <div className="lg:col-span-1">
                <AIScoreCard ticker={ticker} />

                {/* Company Profile (from overview) */}
                {overview?.profile && (
                  <div className="mt-4 p-4 rounded-lg bg-tron-bg-card border border-tron glow-border">
                    <h3 className="font-heading text-sm text-tron-orange mb-3">
                      Company Profile
                    </h3>
                    <dl className="space-y-2 text-sm">
                      {[
                        ['Symbol', overview.profile.symbol],
                        ['IPO Date', overview.profile.ipoDate],
                        ['CEO', overview.profile.ceo],
                        ['Employees', overview.profile.fullTimeEmployees?.toLocaleString()],
                        ['Sector', overview.profile.sector],
                        ['Industry', overview.profile.industry],
                        ['Country', overview.profile.country],
                        ['Exchange', overview.profile.exchange],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, value]) => (
                          <div key={label as string} className="flex justify-between">
                            <dt className="text-tron-text-secondary">{label}</dt>
                            <dd className="text-tron-text-primary text-right max-w-[60%] truncate">
                              {value}
                            </dd>
                          </div>
                        ))}
                    </dl>
                    {overview.profile.description && (
                      <p className="mt-3 text-xs text-tron-text-secondary leading-relaxed line-clamp-4">
                        {overview.profile.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-tron mt-12 py-6 text-center">
        <p className="text-xs text-tron-text-secondary/60">
          Built by Shriansh Jena
        </p>
        <p className="text-xs text-tron-text-secondary/40 mt-1">
          For informational purposes only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
