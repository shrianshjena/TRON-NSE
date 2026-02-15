import { getDb } from './connection';
import type { AIScoreResult } from '@/lib/types/ai-score';

/**
 * Log an AI score result for the given ticker.
 */
export async function logAIScore(ticker: string, result: AIScoreResult): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `
      INSERT INTO ai_score_logs (
        ticker, score, classification, grade, confidence,
        breakdown_json, valuation_analysis, financial_health_analysis,
        growth_outlook, risk_factors_json, short_term_outlook,
        long_term_outlook, sentiment_summary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    args: [
      ticker,
      result.score,
      result.classification,
      result.grade,
      result.confidence,
      JSON.stringify(result.breakdown),
      result.valuationAnalysis,
      result.financialHealthAnalysis,
      result.growthOutlook,
      JSON.stringify(result.riskFactors),
      result.shortTermOutlook,
      result.longTermOutlook,
      result.sentimentSummary,
    ],
  });
}

/**
 * Get AI score history for a ticker, ordered by most recent first.
 */
export async function getScoreHistory(ticker: string, limit: number = 10): Promise<AIScoreResult[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM ai_score_logs WHERE ticker = ? ORDER BY created_at DESC LIMIT ?`,
    args: [ticker, limit],
  });
  return result.rows.map(rowToResult);
}

/**
 * Get the latest AI score for a ticker, or null if none exists.
 */
export async function getLatestScore(ticker: string): Promise<AIScoreResult | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM ai_score_logs WHERE ticker = ? ORDER BY created_at DESC LIMIT 1`,
    args: [ticker],
  });
  return result.rows.length > 0 ? rowToResult(result.rows[0]) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToResult(row: any): AIScoreResult {
  return {
    score: Number(row.score),
    classification: row.classification as AIScoreResult['classification'],
    grade: row.grade as AIScoreResult['grade'],
    breakdown: JSON.parse(row.breakdown_json as string),
    confidence: Number(row.confidence),
    valuationAnalysis: (row.valuation_analysis as string) ?? '',
    financialHealthAnalysis: (row.financial_health_analysis as string) ?? '',
    growthOutlook: (row.growth_outlook as string) ?? '',
    riskFactors: row.risk_factors_json ? JSON.parse(row.risk_factors_json as string) : [],
    shortTermOutlook: (row.short_term_outlook as string) ?? '',
    longTermOutlook: (row.long_term_outlook as string) ?? '',
    sentimentSummary: (row.sentiment_summary as string) ?? '',
    timestamp: row.created_at as string,
  };
}
