import { TECHNICAL_WEIGHTS } from './weights';
import type { ScoringMetrics, CategoryResult } from './engine';

function lerp(value: number, lowVal: number, highVal: number, lowScore: number, highScore: number): number {
  const t = (value - lowVal) / (highVal - lowVal);
  return lowScore + t * (highScore - lowScore);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Scores the price position within the 52-week range.
 * Mid-range (40-60% of range) is ideal, indicating balanced momentum without overextension.
 * Returns null if high equals low or data is missing.
 */
function scorePrice52wPosition(
  currentPrice: number | null,
  weekLow52: number | null,
  weekHigh52: number | null
): number | null {
  if (currentPrice === null || weekLow52 === null || weekHigh52 === null) return null;
  if (weekHigh52 <= weekLow52) return null;

  const position = ((currentPrice - weekLow52) / (weekHigh52 - weekLow52)) * 100;

  // Peak score at 50% (center of range), tapering off toward extremes
  if (position >= 40 && position <= 60) return 100;
  if (position >= 30 && position < 40) return clamp(lerp(position, 30, 40, 80, 100), 80, 100);
  if (position > 60 && position <= 70) return clamp(lerp(position, 60, 70, 100, 80), 80, 100);
  if (position >= 20 && position < 30) return clamp(lerp(position, 20, 30, 55, 80), 55, 80);
  if (position > 70 && position <= 80) return clamp(lerp(position, 70, 80, 80, 55), 55, 80);
  if (position >= 10 && position < 20) return clamp(lerp(position, 10, 20, 35, 55), 35, 55);
  if (position > 80 && position <= 90) return clamp(lerp(position, 80, 90, 55, 35), 35, 55);
  if (position < 10) return clamp(lerp(position, 0, 10, 20, 35), 20, 35);
  // position > 90
  return clamp(lerp(position, 90, 100, 35, 20), 20, 35);
}

/**
 * Scores the 14-day Relative Strength Index.
 * RSI 40-60 is ideal (neutral momentum). Extremes indicate overbought/oversold conditions.
 */
function scoreRsi(rsi: number | null): number | null {
  if (rsi === null) return null;

  const clamped = clamp(rsi, 0, 100);

  if (clamped >= 40 && clamped <= 60) return 100;
  if (clamped >= 30 && clamped < 40) return clamp(lerp(clamped, 30, 40, 60, 100), 60, 100);
  if (clamped > 60 && clamped <= 70) return clamp(lerp(clamped, 60, 70, 100, 60), 60, 100);
  if (clamped >= 20 && clamped < 30) return clamp(lerp(clamped, 20, 30, 40, 60), 40, 60);
  if (clamped > 70 && clamped <= 80) return clamp(lerp(clamped, 70, 80, 60, 40), 40, 60);
  if (clamped < 20) return clamp(lerp(clamped, 0, 20, 30, 40), 30, 40);
  // clamped > 80
  return clamp(lerp(clamped, 80, 100, 40, 30), 30, 40);
}

/**
 * Scores price relative to the 200-day moving average.
 * Slightly above (0-10%) is ideal, indicating healthy uptrend without overextension.
 * @param priceVs200dma Percentage above/below 200 DMA (e.g., 5 means 5% above)
 */
function scorePriceVs200dma(priceVs200dma: number | null): number | null {
  if (priceVs200dma === null) return null;

  if (priceVs200dma >= 0 && priceVs200dma <= 10) return 100;
  if (priceVs200dma > 10 && priceVs200dma <= 20) return clamp(lerp(priceVs200dma, 10, 20, 100, 60), 60, 100);
  if (priceVs200dma > 20 && priceVs200dma <= 40) return clamp(lerp(priceVs200dma, 20, 40, 60, 30), 30, 60);
  if (priceVs200dma > 40) return 30;
  if (priceVs200dma >= -10 && priceVs200dma < 0) return clamp(lerp(priceVs200dma, -10, 0, 50, 100), 50, 100);
  if (priceVs200dma >= -25 && priceVs200dma < -10) return clamp(lerp(priceVs200dma, -25, -10, 30, 50), 30, 50);
  return 30;
}

/**
 * Computes the technical category score (15% of total).
 * Evaluates price positioning, RSI momentum, and trend strength via 200 DMA.
 */
export function scoreTechnical(metrics: ScoringMetrics): CategoryResult {
  const pricePosition = metrics.weekHigh52 !== null && metrics.weekLow52 !== null && metrics.currentPrice !== null
    ? (((metrics.currentPrice - metrics.weekLow52) / (metrics.weekHigh52 - metrics.weekLow52)) * 100)
    : null;

  const subScores: { key: string; weight: number; score: number | null; rawValue: number | string | null }[] = [
    {
      key: '52W Range Position',
      weight: TECHNICAL_WEIGHTS.PRICE_52W_POSITION,
      score: scorePrice52wPosition(metrics.currentPrice, metrics.weekLow52, metrics.weekHigh52),
      rawValue: pricePosition !== null ? `${pricePosition.toFixed(1)}%` : null,
    },
    {
      key: 'RSI (14)',
      weight: TECHNICAL_WEIGHTS.RSI_14,
      score: scoreRsi(metrics.rsi14),
      rawValue: metrics.rsi14,
    },
    {
      key: 'Price vs 200 DMA',
      weight: TECHNICAL_WEIGHTS.PRICE_VS_200DMA,
      score: scorePriceVs200dma(metrics.priceVs200dma),
      rawValue: metrics.priceVs200dma !== null ? `${metrics.priceVs200dma > 0 ? '+' : ''}${metrics.priceVs200dma.toFixed(1)}%` : null,
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
