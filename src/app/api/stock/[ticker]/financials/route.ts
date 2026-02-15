import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildCacheKey, getOrSet } from '@/lib/cache';
import { queryPerplexity } from '@/lib/perplexity/client';
import { buildFinancialsPrompt, SYSTEM_PROMPT } from '@/lib/perplexity/prompts';
import { parsePerplexityResponse } from '@/lib/perplexity/parse';
import { FinancialsResponseSchema } from '@/lib/perplexity/schemas';
import { sanitizeTicker } from '@/lib/utils/sanitize';
import type { FinancialStatement, FinancialPeriod } from '@/lib/types/financial';

const FINANCIALS_CACHE_TTL = 1800; // 30 minutes
const VALID_PERIODS: FinancialPeriod[] = ['annual', 'quarterly', 'ttm'];

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

    // Validate period param
    const periodParam = request.nextUrl.searchParams.get('period') ?? 'annual';
    if (!VALID_PERIODS.includes(periodParam as FinancialPeriod)) {
        return NextResponse.json(
            { error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` },
            { status: 400 }
        );
    }
    const period = periodParam as FinancialPeriod;

    const cacheKey = buildCacheKey('financials', ticker, period);

    try {
        const { data, cached } = await getOrSet<FinancialStatement>(
            cacheKey,
            FINANCIALS_CACHE_TTL,
            async () => {
                const prompt = buildFinancialsPrompt(ticker, period);
                const raw = await queryPerplexity(prompt, SYSTEM_PROMPT);
                const parsed = parsePerplexityResponse(raw, FinancialsResponseSchema);
                return parsed as FinancialStatement;
            }
        );

        return NextResponse.json({ ...data, cached });
    } catch (error) {
        console.error(`[financials] Error for ${ticker} (${period}):`, error);
        return NextResponse.json(
            { error: 'Failed to fetch financial data. Please try again.' },
            { status: 500 }
        );
    }
}
