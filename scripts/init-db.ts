/**
 * Initialize the Turso database with all required tables.
 * Usage: npx tsx scripts/init-db.ts
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        console.error('❌ TURSO_DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    console.log(`🔗 Connecting to Turso: ${url}`);

    const client = createClient({ url, authToken });

    await client.executeMultiple(`
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

    // Verify tables
    const tables = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables:');
    for (const row of tables.rows) {
        console.log(`   - ${row.name}`);
    }

    client.close();
}

main().catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});
