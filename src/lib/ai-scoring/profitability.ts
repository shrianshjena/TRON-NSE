import { PROFITABILITY_WEIGHTS } from './weights';
import type { ScoringMetrics, CategoryResult } from './engine';

function lerp(value: number, lowVal: number, highVal: number, lowScore: number, highScore: number): number {
  const t = (value - lowVal) / (highVal - lowVal);
  return lowScore + t * (highScore - lowScore);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Scores Return on Equity.
 * Higher ROE indicates more efficient use of shareholder equity.
 * > 20% = 100, 15-20% = 80-100, 10-15% = 50-80, 5-10% = 30-50, < 5% = 10-30
 */
function scoreRoe(roe: number | null): number | null {
  if (roe === null) return null;

  if (roe >= 20) return 100;
  if (roe >= 15) return clamp(lerp(roe, 15, 20, 80, 100), 80, 100);
  if (roe >= 10) return clamp(lerp(roe, 10, 15, 50, 80), 50, 80);
  if (roe >= 5) return clamp(lerp(roe, 5, 10, 30, 50), 30, 50);
  if (roe >= 0) return clamp(lerp(roe, 0, 5, 10, 30), 10, 30);
  return 10;
}

/**
 * Scores Operating Margin.
 * Higher margins indicate better cost control and pricing power.
 * > 25% = 100, 15-25% = 75-100, 8-15% = 50-75, 0-8% = 25-50, < 0% = 0
 */
function scoreOperatingMargin(margin: number | null): number | null {
  if (margin === null) return null;

  if (margin >= 25) return 100;
  if (margin >= 15) return clamp(lerp(margin, 15, 25, 75, 100), 75, 100);
  if (margin >= 8) return clamp(lerp(margin, 8, 15, 50, 75), 50, 75);
  if (margin >= 0) return clamp(lerp(margin, 0, 8, 25, 50), 25, 50);
  return 0;
}

/**
 * Scores Debt-to-Equity ratio.
 * Lower D/E is better, indicating less financial leverage risk.
 * < 0.3 = 100, 0.3-0.7 = 75-100, 0.7-1.0 = 50-75, 1.0-1.5 = 25-50, > 1.5 = 10
 */
function scoreDebtEquity(debtEquity: number | null): number | null {
  if (debtEquity === null) return null;

  if (debtEquity < 0) return 10; // Negative equity edge case
  if (debtEquity <= 0.3) return clamp(lerp(debtEquity, 0, 0.3, 100, 100), 100, 100);
  if (debtEquity <= 0.7) return clamp(lerp(debtEquity, 0.3, 0.7, 100, 75), 75, 100);
  if (debtEquity <= 1.0) return clamp(lerp(debtEquity, 0.7, 1.0, 75, 50), 50, 75);
  if (debtEquity <= 1.5) return clamp(lerp(debtEquity, 1.0, 1.5, 50, 25), 25, 50);
  if (debtEquity <= 2.5) return clamp(lerp(debtEquity, 1.5, 2.5, 25, 10), 10, 25);
  return 10;
}

/**
 * Computes the profitability category score (20% of total).
 * Evaluates ROE, operating margin, and debt-to-equity.
 */
export function scoreProfitability(metrics: ScoringMetrics): CategoryResult {
  const subScores: { key: string; weight: number; score: number | null; rawValue: number | string | null }[] = [
    {
      key: 'ROE',
      weight: PROFITABILITY_WEIGHTS.ROE,
      score: scoreRoe(metrics.roe),
      rawValue: metrics.roe !== null ? `${metrics.roe.toFixed(1)}%` : null,
    },
    {
      key: 'Operating Margin',
      weight: PROFITABILITY_WEIGHTS.OPERATING_MARGIN,
      score: scoreOperatingMargin(metrics.operatingMargin),
      rawValue: metrics.operatingMargin !== null ? `${metrics.operatingMargin.toFixed(1)}%` : null,
    },
    {
      key: 'Debt/Equity',
      weight: PROFITABILITY_WEIGHTS.DEBT_EQUITY,
      score: scoreDebtEquity(metrics.debtToEquity),
      rawValue: metrics.debtToEquity,
    },
  ];

  let totalWeight = 0;
  let weightedSum = 0;
  const metricsOutput: Record<string, number | string | null> = {};

  for (const sub of subScores) {
    metricsOutput[sub.key] = sub.rawValue;
    if (sub.score !== null) {
      totalWeight += sub.weight;
      weightedSum += sub.weight * sub.score;
    }
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const availableCount = subScores.filter(s => s.score !== null).length;

  return {
    score,
    metrics: metricsOutput,
    availableMetrics: availableCount,
    totalMetrics: subScores.length,
  };
}
