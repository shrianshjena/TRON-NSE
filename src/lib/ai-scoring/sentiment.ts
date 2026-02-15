import { SENTIMENT_WEIGHTS } from './weights';
import type { ScoringMetrics, CategoryResult } from './engine';

/**
 * Maps analyst consensus string to a numeric score.
 * Uses partial matching to handle variations in wording from Perplexity responses.
 */
function scoreAnalystConsensus(consensus: string | null): number | null {
  if (consensus === null || consensus.trim() === '') return null;

  const normalized = consensus.toLowerCase().trim();

  // Strong Buy variants
  if (normalized.includes('strong buy') || normalized.includes('strong_buy') || normalized === 'strongbuy') {
    return 100;
  }
  // Strong Sell variants
  if (normalized.includes('strong sell') || normalized.includes('strong_sell') || normalized === 'strongsell') {
    return 5;
  }
  // Buy (must check after strong buy)
  if (normalized === 'buy' || normalized === 'outperform' || normalized === 'overweight') {
    return 80;
  }
  // Sell (must check after strong sell)
  if (normalized === 'sell' || normalized === 'underperform' || normalized === 'underweight') {
    return 20;
  }
  // Hold variants
  if (normalized === 'hold' || normalized === 'neutral' || normalized === 'equal-weight' || normalized === 'market perform') {
    return 50;
  }

  // Fuzzy matching for partial matches
  if (normalized.includes('buy')) return 80;
  if (normalized.includes('sell')) return 20;
  if (normalized.includes('hold') || normalized.includes('neutral')) return 50;
  if (normalized.includes('outperform') || normalized.includes('overweight')) return 80;
  if (normalized.includes('underperform') || normalized.includes('underweight')) return 20;

  return null;
}

/**
 * Maps news sentiment string to a numeric score.
 * Handles various sentiment descriptors from Perplexity responses.
 */
function scoreNewsSentiment(sentiment: string | null): number | null {
  if (sentiment === null || sentiment.trim() === '') return null;

  const normalized = sentiment.toLowerCase().trim();

  if (normalized.includes('very positive') || normalized.includes('strongly positive')) return 95;
  if (normalized.includes('positive') || normalized.includes('bullish') || normalized.includes('optimistic')) return 85;
  if (normalized.includes('mostly positive') || normalized.includes('slightly positive') || normalized.includes('lean positive')) return 70;
  if (normalized.includes('mixed') || normalized.includes('neutral') || normalized.includes('balanced')) return 50;
  if (normalized.includes('mostly negative') || normalized.includes('slightly negative') || normalized.includes('lean negative')) return 35;
  if (normalized.includes('negative') || normalized.includes('bearish') || normalized.includes('pessimistic')) return 20;
  if (normalized.includes('very negative') || normalized.includes('strongly negative')) return 10;

  return null;
}

/**
 * Computes the sentiment category score (10% of total).
 * Evaluates analyst consensus ratings and recent news sentiment.
 */
export function scoreSentiment(metrics: ScoringMetrics): CategoryResult {
  const analystScore = scoreAnalystConsensus(metrics.analystConsensus);
  const newsScore = scoreNewsSentiment(metrics.newsSentiment);

  const subScores: { key: string; weight: number; score: number | null; rawValue: number | string | null }[] = [
    {
      key: 'Analyst Consensus',
      weight: SENTIMENT_WEIGHTS.ANALYST_CONSENSUS,
      score: analystScore,
      rawValue: metrics.analystConsensus,
    },
    {
      key: 'News Sentiment',
      weight: SENTIMENT_WEIGHTS.NEWS_SENTIMENT,
      score: newsScore,
      rawValue: metrics.newsSentiment,
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
