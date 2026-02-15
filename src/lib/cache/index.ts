import NodeCache from 'node-cache';
import { getEnv } from '@/lib/utils/env';

/**
 * TTL constants in seconds, sourced from environment variables.
 */
export function getCacheTTL() {
  const env = getEnv();
  return {
    OVERVIEW: env.CACHE_TTL_OVERVIEW,       // default 300s (5 min)
    FINANCIALS: env.CACHE_TTL_FINANCIALS,   // default 3600s (1 hour)
    HISTORICAL: env.CACHE_TTL_HISTORICAL,   // default 300s (5 min)
    AI_SCORE: env.CACHE_TTL_AI_SCORE,       // default 1800s (30 min)
    SEARCH: 60,                              // 1 min
    POPULAR: 120,                            // 2 min
  } as const;
}

/**
 * Global in-memory cache instance.
 * Default TTL = 300s, check period = 120s.
 */
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 120,
  useClones: false,
  deleteOnExpire: true,
});

export default cache;

/**
 * Build a namespaced cache key.
 */
export function buildCacheKey(namespace: string, ...parts: string[]): string {
  return `${namespace}:${parts.join(':')}`;
}

/**
 * Get or set a cached value. If the key is not in the cache,
 * the fetcher function runs and its result is cached.
 */
export async function getOrSet<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  const existing = cache.get<T>(key);
  if (existing !== undefined) {
    return { data: existing, cached: true };
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return { data, cached: false };
}
