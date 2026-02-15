import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildCacheKey, getOrSet } from '@/lib/cache';
import { queryPerplexity } from '@/lib/perplexity/client';
import { buildOverviewPrompt, SYSTEM_PROMPT } from '@/lib/perplexity/prompts';
import { parsePerplexityResponse } from '@/lib/perplexity/parse';
import { OverviewResponseSchema } from '@/lib/perplexity/schemas';
import { sanitizeTicker } from '@/lib/utils/sanitize';
import { logSearch } from '@/lib/db/search-history';
import { incrementSearchCount } from '@/lib/db/popular-tickers';
import type { StockOverviewResponse } from '@/lib/types/stock';

const OVERVIEW_CACHE_TTL = 120; // 2 minutes

export async function GET(
    request: NextRequest,
    { params }: { params: { ticker: string } }
) {
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

    // Validate ticker
    const ticker = sanitizeTicker(params.ticker);
    if (!ticker) {
        return NextResponse.json(
            { error: 'Invalid ticker symbol.' },
            { status: 400 }
        );
    }

    const cacheKey = buildCacheKey('overview', ticker);

    try {
        const { data, cached } = await getOrSet<StockOverviewResponse>(
            cacheKey,
            OVERVIEW_CACHE_TTL,
            async () => {
                const prompt = buildOverviewPrompt(ticker);
                const raw = await queryPerplexity(prompt, SYSTEM_PROMPT);
                const parsed = parsePerplexityResponse(raw, OverviewResponseSchema);
                return parsed as StockOverviewResponse;
            }
        );

        // Log search (non-blocking, best-effort)
        try {
            const companyName = data.profile?.companyName ?? ticker;
            await logSearch(ticker, companyName);
            await incrementSearchCount(ticker, companyName);
        } catch {
            // DB logging should not break the response
        }

        return NextResponse.json({ ...data, cached });
    } catch (error) {
        console.error(`[overview] Error for ${ticker}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch stock overview. Please try again.' },
            { status: 500 }
        );
    }
}
