import { getDb } from './connection';

export interface SearchHistoryEntry {
  id: number;
  ticker: string;
  companyName: string;
  searchedAt: string;
}

export interface MostSearchedEntry {
  ticker: string;
  companyName: string;
  searchCount: number;
}

/**
 * Log a search event for the given ticker.
 */
export async function logSearch(ticker: string, companyName: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO search_history (ticker, company_name, searched_at) VALUES (?, ?, datetime('now'))`,
    args: [ticker, companyName],
  });
}

/**
 * Get the most recent searches, with optional limit.
 * Returns distinct tickers, most recent first.
 */
export async function getRecentSearches(limit: number = 20): Promise<SearchHistoryEntry[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT sh.id, sh.ticker, sh.company_name AS companyName, sh.searched_at AS searchedAt
      FROM search_history sh
      INNER JOIN (
        SELECT ticker, MAX(searched_at) AS max_searched_at
        FROM search_history
        GROUP BY ticker
      ) latest ON sh.ticker = latest.ticker AND sh.searched_at = latest.max_searched_at
      ORDER BY sh.searched_at DESC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows as unknown as SearchHistoryEntry[];
}

/**
 * Get the most frequently searched tickers.
 */
export async function getMostSearched(limit: number = 10): Promise<MostSearchedEntry[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT ticker, company_name AS companyName, COUNT(*) AS searchCount
      FROM search_history
      GROUP BY ticker
      ORDER BY searchCount DESC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows as unknown as MostSearchedEntry[];
}
