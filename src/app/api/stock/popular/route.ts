import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildCacheKey, getOrSet } from '@/lib/cache';
import { getPopularTickers } from '@/lib/db/popular-tickers';
import { NSE_TICKERS, SITE_CONFIG } from '@/lib/utils/constants';
import type { PopularTicker } from '@/lib/types/api';

const POPULAR_CACHE_TTL = 900; // 15 minutes

/** Hardcoded fallback when DB has no data */
const FALLBACK_POPULAR: PopularTicker[] = NSE_TICKERS.slice(0, 10).map((t) => ({
  ticker: t.ticker,
  companyName: t.companyName,
  searchCount: 0,
  lastPrice: null,
  priceChangePct: null,
}));

export async function GET(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const cacheKey = buildCacheKey('popular', 'tickers');

  try {
    const { data, cached } = await getOrSet<PopularTicker[]>(cacheKey, POPULAR_CACHE_TTL, async () => {
      try {
        const tickers = await getPopularTickers(SITE_CONFIG.maxPopularTickers);
        if (tickers.length > 0) {
          return tickers;
        }
      } catch {
        // DB not available; fall through to fallback
      }
      return FALLBACK_POPULAR;
    });

    return NextResponse.json({ tickers: data, cached });
  } catch (error) {
    console.error('[popular] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
