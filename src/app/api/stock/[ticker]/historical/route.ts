import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildCacheKey, getOrSet } from '@/lib/cache';
import { queryPerplexity } from '@/lib/perplexity/client';
import { buildHistoricalPrompt, SYSTEM_PROMPT } from '@/lib/perplexity/prompts';
import { parsePerplexityResponse } from '@/lib/perplexity/parse';
import { HistoricalResponseSchema } from '@/lib/perplexity/schemas';
import { sanitizeTicker } from '@/lib/utils/sanitize';
import type { HistoricalDataPoint, HistoricalRange } from '@/lib/types/financial';

const VALID_RANGES: HistoricalRange[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

/** Short-lived data (intraday) gets 5 min, everything else gets 1 hour */
function getTTL(range: HistoricalRange): number {
    if (range === '1D') return 300;    // 5 minutes
    if (range === '5D') return 600;    // 10 minutes
    return 3600;                       // 1 hour
}

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

    // Validate range param
    const rangeParam = (request.nextUrl.searchParams.get('range') ?? '1M').toUpperCase();
    if (!VALID_RANGES.includes(rangeParam as HistoricalRange)) {
        return NextResponse.json(
            { error: `Invalid range. Must be one of: ${VALID_RANGES.join(', ')}` },
            { status: 400 }
        );
    }
    const range = rangeParam as HistoricalRange;

    const cacheKey = buildCacheKey('historical', ticker, range);

    try {
        const { data, cached } = await getOrSet<{ data: HistoricalDataPoint[] }>(
            cacheKey,
            getTTL(range),
            async () => {
                const prompt = buildHistoricalPrompt(ticker, range);
                const raw = await queryPerplexity(prompt, SYSTEM_PROMPT);
                const parsed = parsePerplexityResponse(raw, HistoricalResponseSchema);
                return parsed as { data: HistoricalDataPoint[] };
            }
        );

        return NextResponse.json({ ...data, range, cached });
    } catch (error) {
        console.error(`[historical] Error for ${ticker} (${range}):`, error);
        return NextResponse.json(
            { error: 'Failed to fetch historical data. Please try again.' },
            { status: 500 }
        );
    }
}
