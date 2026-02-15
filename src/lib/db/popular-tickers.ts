import { getDb } from './connection';
import type { PopularTicker } from '@/lib/types/api';

/**
 * Get the most popular tickers ranked by search count.
 */
export async function getPopularTickers(limit: number = 10): Promise<PopularTicker[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT
        ticker,
        company_name AS companyName,
        search_count AS searchCount,
        last_price AS lastPrice,
        price_change_pct AS priceChangePct
      FROM popular_tickers
      ORDER BY search_count DESC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows as unknown as PopularTicker[];
}

/**
 * Update or insert a popular ticker entry with the latest price data.
 */
export async function updatePopularTicker(
  ticker: string,
  companyName: string,
  price: number | null,
  changePct: number | null
): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `
      INSERT INTO popular_tickers (ticker, company_name, search_count, last_price, price_change_pct, updated_at)
      VALUES (?, ?, 1, ?, ?, datetime('now'))
      ON CONFLICT(ticker) DO UPDATE SET
        company_name = excluded.company_name,
        last_price = excluded.last_price,
        price_change_pct = excluded.price_change_pct,
        updated_at = datetime('now')
    `,
    args: [ticker, companyName, price, changePct],
  });
}

/**
 * Increment the search count for an existing ticker,
 * or insert a new entry if it doesn't exist.
 */
export async function incrementSearchCount(ticker: string, companyName?: string): Promise<void> {
  const db = getDb();

  const result = await db.execute({
    sql: 'SELECT ticker FROM popular_tickers WHERE ticker = ?',
    args: [ticker],
  });

  if (result.rows.length > 0) {
    await db.execute({
      sql: `UPDATE popular_tickers SET search_count = search_count + 1, updated_at = datetime('now') WHERE ticker = ?`,
      args: [ticker],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO popular_tickers (ticker, company_name, search_count, updated_at) VALUES (?, ?, 1, datetime('now'))`,
      args: [ticker, companyName ?? ticker],
    });
  }
}
