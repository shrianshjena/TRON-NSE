'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CurrencyRain } from './currency-rain';
import { PerspectiveGrid } from './perspective-grid';
import { TronDisc } from './tron-disc';
import { PopularTickers } from './popular-tickers';

export function HeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = searchValue.trim().toUpperCase();
    if (ticker) {
      router.push(`/stock/${ticker}`);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <PerspectiveGrid />
      <CurrencyRain />

      {/* Central disc behind content */}
      <TronDisc className="w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 opacity-30" />

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider mb-4 glow-text">
          THE FUTURE OF NSE INTELLIGENCE
        </h1>
        <p className="text-lg sm:text-xl text-tron-text-secondary mb-10">
          AI-Powered Equity Analysis Engine
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto mb-6">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter NSE ticker (e.g., TATASTEEL)"
              className="w-full px-5 py-3.5 bg-tron-bg-card border border-tron rounded-lg text-tron-text-primary placeholder:text-tron-text-secondary/50 focus:outline-none focus:border-tron-orange/50 focus:shadow-tron-glow transition-all font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-tron-orange text-black font-heading text-sm tracking-wider rounded-lg shadow-tron-glow hover:shadow-tron-glow-strong hover:bg-tron-orange-light transition-all whitespace-nowrap"
          >
            Search Any NSE Stock
          </button>
        </form>

        <button
          onClick={() => router.push('#popular')}
          className="text-sm text-tron-text-secondary hover:text-tron-orange transition-colors"
        >
          View Top Movers →
        </button>
      </div>

      {/* Popular tickers */}
      <div id="popular" className="relative z-10 mt-8 w-full">
        <PopularTickers />
      </div>

      {/* Footer credit */}
      <div className="relative z-10 mt-auto pb-8 pt-16 text-center">
        <p className="text-xs text-tron-text-secondary/60">
          Built by Shriansh Jena
        </p>
      </div>
    </section>
  );
}
