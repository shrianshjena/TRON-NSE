import { GROWTH_WEIGHTS } from './weights';
import type { ScoringMetrics, CategoryResult } from './engine';

function lerp(value: number, lowVal: number, highVal: number, lowScore: number, highScore: number): number {
  const t = (value - lowVal) / (highVal - lowVal);
  return lowScore + t * (highScore - lowScore);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Scores a growth rate using a consistent scale:
 * > 25% = 100, 15-25% = 80-100, 5-15% = 50-80, 0-5% = 30-50, < 0 = 10-30
 * Uses linear interpolation between thresholds.
 * @param growthPct Growth rate as percentage (e.g., 15 for 15%)
 */
function scoreGrowthRate(growthPct: number | null): number | null {
  if (growthPct === null) return null;

  if (growthPct >= 25) return 100;
  if (growthPct >= 15) return clamp(lerp(growthPct, 15, 25, 80, 100), 80, 100);
  if (growthPct >= 5) return clamp(lerp(growthPct, 5, 15, 50, 80), 50, 80);
  if (growthPct >= 0) return clamp(lerp(growthPct, 0, 5, 30, 50), 30, 50);
  if (growthPct >= -15) return clamp(lerp(growthPct, -15, 0, 10, 30), 10, 30);
  return 10;
}

/**
 * Computes the growth category score (25% of total).
 * Evaluates revenue growth, EPS growth, and profit growth year-over-year.
 */
export function scoreGrowth(metrics: ScoringMetrics): CategoryResult {
  const subScores: { key: string; weight: number; score: number | null; rawValue: number | string | null }[] = [
    {
      key: 'Revenue Growth YoY',
      weight: GROWTH_WEIGHTS.REVENUE_GROWTH_YOY,
      score: scoreGrowthRate(metrics.revenueGrowthYoY),
      rawValue: metrics.revenueGrowthYoY !== null ? `${metrics.revenueGrowthYoY.toFixed(1)}%` : null,
    },
    {
      key: 'EPS Growth YoY',
      weight: GROWTH_WEIGHTS.EPS_GROWTH_YOY,
      score: scoreGrowthRate(metrics.epsGrowthYoY),
      rawValue: metrics.epsGrowthYoY !== null ? `${metrics.epsGrowthYoY.toFixed(1)}%` : null,
    },
    {
      key: 'Profit Growth YoY',
      weight: GROWTH_WEIGHTS.PROFIT_GROWTH_YOY,
      score: scoreGrowthRate(metrics.profitGrowthYoY),
      rawValue: metrics.profitGrowthYoY !== null ? `${metrics.profitGrowthYoY.toFixed(1)}%` : null,
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
