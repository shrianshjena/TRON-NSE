import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

/**
 * Get the singleton Turso database client.
 */
export function getDb(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set');
  }

  client = createClient({
    url,
    authToken,
  });

  return client;
}

/**
 * Initialize all database tables. Must be called once at startup.
 */
export async function initializeDb(): Promise<void> {
  const db = getDb();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      company_name TEXT NOT NULL,
      searched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(ticker, searched_at)
    );

    CREATE INDEX IF NOT EXISTS idx_search_history_ticker
      ON search_history(ticker);
    CREATE INDEX IF NOT EXISTS idx_search_history_searched_at
      ON search_history(searched_at DESC);

    CREATE TABLE IF NOT EXISTS popular_tickers (
      ticker TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      search_count INTEGER NOT NULL DEFAULT 1,
      last_price REAL,
      price_change_pct REAL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_popular_tickers_count
      ON popular_tickers(search_count DESC);

    CREATE TABLE IF NOT EXISTS ai_score_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      score REAL NOT NULL,
      classification TEXT NOT NULL,
      grade TEXT NOT NULL,
      confidence REAL NOT NULL,
      breakdown_json TEXT NOT NULL,
      valuation_analysis TEXT,
      financial_health_analysis TEXT,
      growth_outlook TEXT,
      risk_factors_json TEXT,
      short_term_outlook TEXT,
      long_term_outlook TEXT,
      sentiment_summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_ai_score_logs_ticker
      ON ai_score_logs(ticker);
    CREATE INDEX IF NOT EXISTS idx_ai_score_logs_created_at
      ON ai_score_logs(created_at DESC);
  `);
}

/**
 * Close the database connection.
 */
export function closeDb(): void {
  if (client) {
    client.close();
    client = null;
  }
}
