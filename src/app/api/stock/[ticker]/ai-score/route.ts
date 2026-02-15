import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { buildCacheKey, getOrSet } from '@/lib/cache';
import { calculateAIScore } from '@/lib/ai-scoring/engine';
import { sanitizeTicker } from '@/lib/utils/sanitize';
import { logAIScore } from '@/lib/db/ai-score-logs';
import type { AIScoreResult } from '@/lib/types/ai-score';

const AI_SCORE_CACHE_TTL = 3600; // 1 hour

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

    const cacheKey = buildCacheKey('ai-score', ticker);

    try {
        const { data, cached } = await getOrSet<AIScoreResult>(
            cacheKey,
            AI_SCORE_CACHE_TTL,
            async () => {
                const result = await calculateAIScore(ticker);

                // Log to DB (non-blocking, best-effort)
                try {
                    await logAIScore(ticker, result);
                } catch {
                    // DB logging should not break the response
                }

                return result;
            }
        );

        return NextResponse.json({ ...data, cached });
    } catch (error) {
        console.error(`[ai-score] Error for ${ticker}:`, error);
        return NextResponse.json(
            { error: 'Failed to calculate AI score. Please try again.' },
            { status: 500 }
        );
    }
}
