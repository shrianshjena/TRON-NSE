import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildCacheKey, getOrSet } from '@/lib/cache';
import { queryPerplexity } from '@/lib/perplexity/client';
import { buildEarningsPrompt, SYSTEM_PROMPT } from '@/lib/perplexity/prompts';
import { parsePerplexityResponse } from '@/lib/perplexity/parse';
import { EarningsResponseSchema } from '@/lib/perplexity/schemas';
import { sanitizeTicker } from '@/lib/utils/sanitize';
import type { EarningsData } from '@/lib/types/financial';

const EARNINGS_CACHE_TTL = 1800; // 30 minutes

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

    const cacheKey = buildCacheKey('earnings', ticker);

    try {
        const { data, cached } = await getOrSet<EarningsData>(
            cacheKey,
            EARNINGS_CACHE_TTL,
            async () => {
                const prompt = buildEarningsPrompt(ticker);
                const raw = await queryPerplexity(prompt, SYSTEM_PROMPT);
                const parsed = parsePerplexityResponse(raw, EarningsResponseSchema);
                return parsed as EarningsData;
            }
        );

        return NextResponse.json({ ...data, cached });
    } catch (error) {
        console.error(`[earnings] Error for ${ticker}:`, error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: 'Failed to fetch earnings data. Please try again.' },
            { status: 500 }
        );
    }
}
