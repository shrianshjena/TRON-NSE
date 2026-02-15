'use client';

import { useEffect, useState } from 'react';
import { TronDisc } from '@/components/landing/tron-disc';

interface StockHeaderProps {
  ticker: string;
  data: any;
  loading: boolean;
}

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value) return;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

export function StockHeader({ ticker, data, loading }: StockHeaderProps) {
  const overview = data?.overview;
  const price = overview?.currentPrice;
  const prevClose = overview?.previousClose;
  const change = price && prevClose ? price - prevClose : null;
  const changePct = change && prevClose ? (change / prevClose) * 100 : null;
  const isPositive = change !== null && change >= 0;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-48 bg-tron-bg-card rounded mb-3" />
        <div className="h-10 w-40 bg-tron-bg-card rounded mb-2" />
        <div className="h-4 w-32 bg-tron-bg-card rounded" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* TRON disc behind price */}
      {price && (
        <TronDisc className="w-48 h-48 -right-4 -top-4 opacity-20 hidden lg:block" />
      )}

      <div className="relative z-10">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold heading-glow-underline mb-1">
          {data?.profile?.companyName || ticker}
        </h1>
        <div className="text-sm text-tron-text-secondary font-mono mb-3">
          {ticker} · NSE
        </div>

        {price !== null && price !== undefined && (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-tron-text-primary">
              <AnimatedNumber value={price} prefix="₹" />
            </span>
            {change !== null && changePct !== null && (
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-mono text-lg ${
                    isPositive ? 'glow-text-green' : 'glow-text-red'
                  }`}
                >
                  {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)}
                </span>
                <span
                  className={`font-mono text-sm px-2 py-0.5 rounded ${
                    isPositive
                      ? 'bg-tron-green/10 text-tron-green'
                      : 'bg-tron-red/10 text-tron-red'
                  }`}
                >
                  {isPositive ? '↑' : '↓'} {Math.abs(changePct).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}

        {overview?.timestamp && (
          <div className="text-xs text-tron-text-secondary mt-1 font-mono">
            {overview.timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
