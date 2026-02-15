import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import cache, { buildCacheKey, getOrSet } from '@/lib/cache';
import { NSE_TICKERS, SITE_CONFIG } from '@/lib/utils/constants';
import { queryPerplexity } from '@/lib/perplexity/client';
import { buildSearchPrompt } from '@/lib/perplexity/prompts';
import { parsePerplexityResponse } from '@/lib/perplexity/parse';
import { searchResultsSchema } from '@/lib/perplexity/schemas';
import type { SearchResult } from '@/lib/types/api';

const SEARCH_CACHE_TTL = 300; // 5 minutes

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

  // Validate query param
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required.' }, { status: 400 });
  }

  if (q.length > 100) {
    return NextResponse.json({ error: 'Query is too long.' }, { status: 400 });
  }

  const cacheKey = buildCacheKey('search', q.toLowerCase());

  try {
    const { data, cached } = await getOrSet<SearchResult[]>(cacheKey, SEARCH_CACHE_TTL, async () => {
      // Always filter from local NSE_TICKERS list
      const query = q.toUpperCase();
      const localResults: SearchResult[] = NSE_TICKERS.filter(
        (t) =>
          t.ticker.includes(query) ||
          t.companyName.toUpperCase().includes(query)
      ).map((t) => ({
        ticker: t.ticker,
        companyName: t.companyName,
      }));

      // For longer queries, also query Perplexity for more matches
      if (q.length > 3) {
        try {
          const prompt = buildSearchPrompt(q);
          const raw = await queryPerplexity(prompt);
          const parsed = parsePerplexityResponse(raw, searchResultsSchema);
          const perplexityResults: SearchResult[] = (parsed as SearchResult[]).filter(
            (r) => !localResults.some((lr) => lr.ticker === r.ticker)
          );
          localResults.push(...perplexityResults);
        } catch {
          // Perplexity search failed; fall back to local results only
        }
      }

      return localResults.slice(0, SITE_CONFIG.maxSearchResults);
    });

    return NextResponse.json({ results: data, cached });
  } catch (error) {
    console.error('[search] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
