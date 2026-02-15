import NodeCache from 'node-cache';
import { getEnv } from '@/lib/utils/env';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * In-memory rate limiter backed by node-cache.
 * Each identifier (e.g. IP address) gets a sliding window of requests.
 */
const rateLimitStore = new NodeCache({
  stdTTL: 120,
  checkperiod: 60,
  useClones: false,
});

/**
 * Check and consume a rate limit token for the given identifier.
 *
 * @param identifier - Unique key for the requester (e.g. IP address, API key)
 * @returns Object indicating whether the request is allowed, remaining tokens, and reset time.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const env = getEnv();
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const now = Date.now();

  const existing = rateLimitStore.get<RateLimitEntry>(identifier);

  if (!existing || now >= existing.resetAt) {
    // Start a new window
    const resetAt = now + windowMs;
    const entry: RateLimitEntry = { count: 1, resetAt };
    const ttlSeconds = Math.ceil(windowMs / 1000);
    rateLimitStore.set(identifier, entry, ttlSeconds);

    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Increment counter
  existing.count += 1;
  rateLimitStore.set(identifier, existing, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Reset rate limit for a specific identifier (useful for testing).
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.del(identifier);
}

/**
 * Flush all rate limit entries.
 */
export function flushAllRateLimits(): void {
  rateLimitStore.flushAll();
}
