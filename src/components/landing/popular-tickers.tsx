'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PopularTicker {
  ticker: string;
  companyName: string;
  lastPrice: number | null;
  priceChangePct: number | null;
}

export function PopularTickers() {
  const [tickers, setTickers] = useState<PopularTicker[]>([]);

  useEffect(() => {
    fetch('/api/stock/popular')
      .then((res) => (res.ok ? res.json() : { tickers: [] }))
      .then((data) => setTickers(data.tickers || []))
      .catch(() => setTickers([]));
  }, []);

  if (tickers.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h3 className="text-sm uppercase tracking-widest text-tron-text-secondary mb-4 text-center">
        Popular Stocks
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tickers.slice(0, 8).map((t) => (
          <Link
            key={t.ticker}
            href={`/stock/${t.ticker}`}
            className="group block p-4 rounded-lg bg-tron-bg-card border border-tron hover-glow transition-all"
          >
            <div className="font-heading text-sm text-tron-orange group-hover:glow-text transition-all">
              {t.ticker}
            </div>
            <div className="text-xs text-tron-text-secondary mt-1 truncate">
              {t.companyName}
            </div>
            {t.lastPrice !== null && (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-sm text-tron-text-primary">
                  ₹{t.lastPrice.toLocaleString('en-IN')}
                </span>
                {t.priceChangePct !== null && (
                  <span
                    className={`text-xs font-mono ${
                      t.priceChangePct >= 0
                        ? 'text-tron-green'
                        : 'text-tron-red'
                    }`}
                  >
                    {t.priceChangePct >= 0 ? '+' : ''}
                    {t.priceChangePct.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
