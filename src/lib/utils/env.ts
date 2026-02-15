import { z } from 'zod';

const envSchema = z.object({
  PERPLEXITY_API_KEY: z.string().min(1, 'PERPLEXITY_API_KEY is required'),
  PERPLEXITY_MODEL: z.string().default('sonar-pro'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  CACHE_TTL_OVERVIEW: z.coerce.number().int().positive().default(300),
  CACHE_TTL_FINANCIALS: z.coerce.number().int().positive().default(3600),
  CACHE_TTL_HISTORICAL: z.coerce.number().int().positive().default(300),
  CACHE_TTL_AI_SCORE: z.coerce.number().int().positive().default(1800),
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL is required'),
  TURSO_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/**
 * Reset cached env (useful for testing).
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}
