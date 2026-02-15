import { VALUATION_WEIGHTS } from './weights';
import type { ScoringMetrics, CategoryResult } from './engine';

/**
 * Linear interpolation between two scoring thresholds.
 * Given a value between lowVal and highVal, returns a score between lowScore and highScore.
 */
function lerp(value: number, lowVal: number, highVal: number, lowScore: number, highScore: number): number {
  const t = (value - lowVal) / (highVal - lowVal);
  return lowScore + t * (highScore - lowScore);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Scores P/E ratio relative to sector average.
 * Lower ratio (compared to sector) is better, indicating relative undervaluation.
 */
function scorePeVsSector(pe: number | null, sectorPe: number | null): number | null {
  if (pe === null || sectorPe === null || sectorPe === 0) return null;

  const ratio = pe / sectorPe;

  if (ratio <= 0) return 10; // Negative P/E edge case
  if (ratio <= 0.5) return 100;
  if (ratio <= 0.7) return clamp(lerp(ratio, 0.5, 0.7, 100, 100), 70, 100);
  if (ratio <= 1.0) return clamp(lerp(ratio, 0.7, 1.0, 100, 70), 70, 100);
  if (ratio <= 1.3) return clamp(lerp(ratio, 1.0, 1.3, 70, 40), 40, 70);
  if (ratio <= 1.8) return clamp(lerp(ratio, 1.3, 1.8, 40, 20), 20, 40);
  return 20;
}

/**
 * Scores Price-to-Book ratio.
 * Lower P/B indicates better value relative to net assets.
 */
function scorePbRatio(pb: number | null): number | null {
  if (pb === null) return null;

  if (pb <= 0) return 10; // Negative book value edge case
  if (pb <= 1.0) return clamp(lerp(pb, 0, 1.0, 100, 100), 100, 100);
  if (pb <= 2.0) return clamp(lerp(pb, 1.0, 2.0, 100, 75), 75, 100);
  if (pb <= 3.0) return clamp(lerp(pb, 2.0, 3.0, 75, 50), 50, 75);
  if (pb <= 5.0) return clamp(lerp(pb, 3.0, 5.0, 50, 25), 25, 50);
  if (pb <= 8.0) return clamp(lerp(pb, 5.0, 8.0, 25, 10), 10, 25);
  return 10;
}

/**
 * Scores Enterprise Value to EBITDA.
 * Lower EV/EBITDA suggests better value.
 */
function scoreEvEbitda(evEbitda: number | null): number | null {
  if (evEbitda === null) return null;

  if (evEbitda <= 0) return 15; // Negative EBITDA edge case
  if (evEbitda <= 6) return 100;
  if (evEbitda <= 8) return clamp(lerp(evEbitda, 6, 8, 100, 100), 100, 100);
  if (evEbitda <= 12) return clamp(lerp(evEbitda, 8, 12, 100, 70), 70, 100);
  if (evEbitda <= 18) return clamp(lerp(evEbitda, 12, 18, 70, 40), 40, 70);
  if (evEbitda <= 25) return clamp(lerp(evEbitda, 18, 25, 40, 15), 15, 40);
  return 15;
}

/**
 * Scores dividend yield.
 * Higher yield is better, with diminishing returns above 4%.
 */
function scoreDividendYield(divYield: number | null): number | null {
  if (divYield === null) return null;

  // divYield expected as percentage (e.g., 2.5 for 2.5%)
  if (divYield <= 0) return 20;
  if (divYield <= 1.0) return clamp(lerp(divYield, 0, 1.0, 20, 40), 20, 40);
  if (divYield <= 2.0) return clamp(lerp(divYield, 1.0, 2.0, 40, 70), 40, 70);
  if (divYield <= 4.0) return clamp(lerp(divYield, 2.0, 4.0, 70, 100), 70, 100);
  return 100;
}

/**
 * Computes the valuation category score (30% of total).
 * Handles null metrics by excluding them and redistributing weights.
 */
export function scoreValuation(metrics: ScoringMetrics): CategoryResult {
  const subScores: { key: string; weight: number; score: number | null; rawValue: number | string | null }[] = [
    {
      key: 'P/E vs Sector',
      weight: VALUATION_WEIGHTS.PE_VS_SECTOR,
      score: scorePeVsSector(metrics.peRatio, metrics.sectorPeRatio),
      rawValue: metrics.peRatio !== null && metrics.sectorPeRatio !== null
        ? `${metrics.peRatio.toFixed(1)} vs ${metrics.sectorPeRatio.toFixed(1)}`
        : null,
    },
    {
      key: 'P/B Ratio',
      weight: VALUATION_WEIGHTS.PB_RATIO,
      score: scorePbRatio(metrics.pbRatio),
      rawValue: metrics.pbRatio,
    },
    {
      key: 'EV/EBITDA',
      weight: VALUATION_WEIGHTS.EV_EBITDA,
      score: scoreEvEbitda(metrics.evToEbitda),
      rawValue: metrics.evToEbitda,
    },
    {
      key: 'Dividend Yield',
      weight: VALUATION_WEIGHTS.DIVIDEND_YIELD,
      score: scoreDividendYield(metrics.dividendYield),
      rawValue: metrics.dividendYield !== null ? `${metrics.dividendYield.toFixed(2)}%` : null,
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
