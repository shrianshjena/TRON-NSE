import { CATEGORY_WEIGHTS } from './weights';
import { scoreValuation } from './valuation';
import { scoreGrowth } from './growth';
import { scoreProfitability } from './profitability';
import { scoreTechnical } from './technical';
import { scoreSentiment } from './sentiment';
import { queryPerplexity } from '@/lib/perplexity/client';
import { buildScoringMetricsPrompt, buildScoreReasoningPrompt } from '@/lib/perplexity/prompts';
import type { AIScoreResult, AIScoreBreakdown, AIGrade, AIClassification } from '@/lib/types/ai-score';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Raw metrics fetched from the Perplexity API. All fields are nullable to
 * handle cases where data is unavailable for a given stock.
 */
export interface ScoringMetrics {
  // Valuation
  peRatio: number | null;
  sectorPeRatio: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
  dividendYield: number | null; // as percentage, e.g. 2.5 for 2.5%

  // Growth (all as percentage, e.g. 15 for 15%)
  revenueGrowthYoY: number | null;
  epsGrowthYoY: number | null;
  profitGrowthYoY: number | null;

  // Profitability (percentages where applicable)
  roe: number | null;
  operatingMargin: number | null;
  debtToEquity: number | null; // ratio, e.g. 0.5

  // Technical
  currentPrice: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  rsi14: number | null;
  priceVs200dma: number | null; // percentage above/below, e.g. 5 for 5% above

  // Sentiment
  analystConsensus: string | null; // e.g. "Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"
  newsSentiment: string | null;   // e.g. "Positive", "Mixed", "Negative"
}

/**
 * Return type from individual category scorers.
 */
export interface CategoryResult {
  score: number;
  metrics: Record<string, number | string | null>;
  availableMetrics: number;
  totalMetrics: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOTAL_METRIC_FIELDS = 18; // Total number of metric fields in ScoringMetrics

/**
 * Maps total score to investment grade.
 */
function mapScoreToGrade(score: number): AIGrade {
  if (score >= 80) return 'Strong Buy';
  if (score >= 65) return 'Buy';
  if (score >= 45) return 'Hold';
  if (score >= 25) return 'Sell';
  return 'Strong Sell';
}

/**
 * Maps total score to market classification.
 */
function mapScoreToClassification(score: number): AIClassification {
  if (score >= 65) return 'Bullish';
  if (score >= 35) return 'Neutral';
  return 'Bearish';
}

/**
 * Calculates confidence (0-100) based on the proportion of non-null metrics.
 * A stock with all 18 metrics available gets 100% confidence.
 */
function calculateConfidence(metrics: ScoringMetrics): number {
  const fields: (keyof ScoringMetrics)[] = [
    'peRatio', 'sectorPeRatio', 'pbRatio', 'evToEbitda', 'dividendYield',
    'revenueGrowthYoY', 'epsGrowthYoY', 'profitGrowthYoY',
    'roe', 'operatingMargin', 'debtToEquity',
    'currentPrice', 'weekHigh52', 'weekLow52', 'rsi14', 'priceVs200dma',
    'analystConsensus', 'newsSentiment',
  ];

  const nonNullCount = fields.filter(f => metrics[f] !== null && metrics[f] !== undefined).length;
  return Math.round((nonNullCount / TOTAL_METRIC_FIELDS) * 100);
}

/**
 * Safely parses a numeric value from the Perplexity JSON response.
 * Returns null for NaN, undefined, or non-numeric values.
 */
function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'n/a') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return isFinite(num) ? num : null;
}

/**
 * Safely extracts a string value from the Perplexity JSON response.
 */
function safeString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length > 0 && str !== 'N/A' && str !== 'n/a' ? str : null;
}

/**
 * Flattens a nested object (e.g. {valuation: {peRatio: 25}}) into {peRatio: 25}.
 */
function flattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested objects
      const nested = flattenObject(value as Record<string, unknown>);
      for (const [nk, nv] of Object.entries(nested)) {
        result[nk] = nv;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Parses the raw JSON response from Perplexity into typed ScoringMetrics.
 * Handles both flat and nested (category-grouped) response formats.
 */
function parseMetricsFromResponse(raw: Record<string, unknown>): ScoringMetrics {
  // Flatten nested structure (e.g. {valuation: {peRatio: ...}, growth: {...}})
  const flat = flattenObject(raw);

  return {
    peRatio: safeNumber(flat.peRatio ?? flat.pe_ratio ?? flat.pe),
    sectorPeRatio: safeNumber(flat.sectorPeRatio ?? flat.sector_pe_ratio ?? flat.sectorPe ?? flat.sectorAvgPE ?? flat.sector_avg_pe),
    pbRatio: safeNumber(flat.pbRatio ?? flat.pb_ratio ?? flat.pb),
    evToEbitda: safeNumber(flat.evToEbitda ?? flat.ev_to_ebitda ?? flat.evEbitda),
    dividendYield: safeNumber(flat.dividendYield ?? flat.dividend_yield),
    revenueGrowthYoY: safeNumber(flat.revenueGrowthYoY ?? flat.revenue_growth_yoy ?? flat.revenueGrowth),
    epsGrowthYoY: safeNumber(flat.epsGrowthYoY ?? flat.eps_growth_yoy ?? flat.epsGrowth),
    profitGrowthYoY: safeNumber(flat.profitGrowthYoY ?? flat.profit_growth_yoy ?? flat.profitGrowth ?? flat.netIncomeGrowthYoY ?? flat.net_income_growth_yoy),
    roe: safeNumber(flat.roe ?? flat.returnOnEquity ?? flat.return_on_equity),
    operatingMargin: safeNumber(flat.operatingMargin ?? flat.operating_margin),
    debtToEquity: safeNumber(flat.debtToEquity ?? flat.debt_to_equity ?? flat.debtEquity),
    currentPrice: safeNumber(flat.currentPrice ?? flat.current_price ?? flat.price),
    weekHigh52: safeNumber(flat.weekHigh52 ?? flat.week_high_52 ?? flat.high52w),
    weekLow52: safeNumber(flat.weekLow52 ?? flat.week_low_52 ?? flat.low52w),
    rsi14: safeNumber(flat.rsi14 ?? flat.rsi ?? flat.rsi_14),
    priceVs200dma: safeNumber(flat.priceVs200dma ?? flat.price_vs_200dma ?? flat.priceVs200DMA ?? flat.priceVsSMA200 ?? flat.price_vs_sma_200),
    analystConsensus: safeString(flat.analystConsensus ?? flat.analyst_consensus ?? flat.consensus ?? flat.analystRating ?? flat.analyst_rating),
    newsSentiment: safeString(flat.newsSentiment ?? flat.news_sentiment ?? flat.sentiment ?? flat.newsScore),
  };
}

// ---------------------------------------------------------------------------
// Main Engine
// ---------------------------------------------------------------------------

/**
 * Calculates the AI investment score for a given NSE stock ticker.
 *
 * Workflow:
 * 1. Fetches raw financial metrics via Perplexity API
 * 2. Runs deterministic scoring across 5 weighted categories
 * 3. Computes overall score, grade, classification, and confidence
 * 4. Generates a reasoning paragraph via a second Perplexity call
 *
 * @param ticker - NSE stock ticker (e.g., "RELIANCE", "TCS", "INFY")
 * @returns Complete AI score result with breakdown and reasoning
 */
export async function calculateAIScore(ticker: string): Promise<AIScoreResult> {
  // Step 1: Fetch raw metrics from Perplexity
  const metricsPrompt = buildScoringMetricsPrompt(ticker);
  const rawMetricsResponse = await queryPerplexity(metricsPrompt);

  let parsedRaw: Record<string, unknown>;
  try {
    // The Perplexity response may contain markdown JSON blocks; extract the JSON
    const jsonMatch = rawMetricsResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawMetricsResponse.trim();
    parsedRaw = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse scoring metrics from Perplexity response for ${ticker}`);
  }

  const metrics = parseMetricsFromResponse(parsedRaw);

  // Step 2: Run each category scorer
  const valuationResult = scoreValuation(metrics);
  const growthResult = scoreGrowth(metrics);
  const profitabilityResult = scoreProfitability(metrics);
  const technicalResult = scoreTechnical(metrics);
  const sentimentResult = scoreSentiment(metrics);

  // Step 3: Compute weighted total score
  const categoryResults: { name: string; weight: number; result: CategoryResult }[] = [
    { name: 'Valuation', weight: CATEGORY_WEIGHTS.VALUATION, result: valuationResult },
    { name: 'Growth', weight: CATEGORY_WEIGHTS.GROWTH, result: growthResult },
    { name: 'Profitability', weight: CATEGORY_WEIGHTS.PROFITABILITY, result: profitabilityResult },
    { name: 'Technical', weight: CATEGORY_WEIGHTS.TECHNICAL, result: technicalResult },
    { name: 'Sentiment', weight: CATEGORY_WEIGHTS.SENTIMENT, result: sentimentResult },
  ];

  // Only include categories that have at least one available metric
  let activeWeightSum = 0;
  let weightedScoreSum = 0;
  const breakdown: AIScoreBreakdown = {
    valuation: { score: valuationResult.score, metrics: valuationResult.metrics },
    growth: { score: growthResult.score, metrics: growthResult.metrics },
    profitability: { score: profitabilityResult.score, metrics: profitabilityResult.metrics },
    technical: { score: technicalResult.score, metrics: technicalResult.metrics },
    sentiment: { score: sentimentResult.score, metrics: sentimentResult.metrics },
  };

  for (const cat of categoryResults) {
    if (cat.result.availableMetrics > 0) {
      activeWeightSum += cat.weight;
      weightedScoreSum += cat.weight * cat.result.score;
    }
  }

  const totalScore = activeWeightSum > 0
    ? Math.round(weightedScoreSum / activeWeightSum)
    : 0;

  // Step 4: Derive grade, classification, confidence
  const grade = mapScoreToGrade(totalScore);
  const classification = mapScoreToClassification(totalScore);
  const confidence = calculateConfidence(metrics);

  // Step 5: Generate reasoning via second Perplexity call
  const reasoningPrompt = buildScoreReasoningPrompt(ticker, totalScore, {
    valuation: { score: valuationResult.score },
    growth: { score: growthResult.score },
    profitability: { score: profitabilityResult.score },
    technical: { score: technicalResult.score },
    sentiment: { score: sentimentResult.score },
  });

  let reasoning: string;
  try {
    reasoning = await queryPerplexity(reasoningPrompt);
    // Clean up any markdown formatting from the response
    reasoning = reasoning.replace(/```[\s\S]*?```/g, '').trim();
    // Limit reasoning length
    if (reasoning.length > 1500) {
      reasoning = reasoning.substring(0, 1497) + '...';
    }
  } catch {
    reasoning = `${ticker} received an AI score of ${totalScore}/100 (${grade}). The analysis is based on available financial metrics across valuation, growth, profitability, technical, and sentiment categories.`;
  }

  // Step 6: Assemble final result
  const result: AIScoreResult = {
    score: totalScore,
    classification,
    grade,
    breakdown,
    confidence,
    valuationAnalysis: formatCategoryAnalysis('Valuation', valuationResult),
    financialHealthAnalysis: formatCategoryAnalysis('Financial Health', profitabilityResult),
    growthOutlook: formatCategoryAnalysis('Growth', growthResult),
    riskFactors: generateRiskFactors(metrics, totalScore),
    shortTermOutlook: generateShortTermOutlook(technicalResult, sentimentResult, grade),
    longTermOutlook: generateLongTermOutlook(valuationResult, growthResult, profitabilityResult, grade),
    sentimentSummary: formatCategoryAnalysis('Sentiment', sentimentResult),
    timestamp: new Date().toISOString(),
  };

  return result;
}

// ---------------------------------------------------------------------------
// Analysis text generators
// ---------------------------------------------------------------------------

function formatCategoryAnalysis(name: string, result: CategoryResult): string {
  const metricEntries = Object.entries(result.metrics)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const coverage = `${result.availableMetrics}/${result.totalMetrics} metrics available`;

  return `${name} Score: ${result.score}/100 (${coverage}). ${metricEntries || 'No metric data available.'}`;
}

function generateRiskFactors(metrics: ScoringMetrics, totalScore: number): string[] {
  const risks: string[] = [];

  if (metrics.debtToEquity !== null && metrics.debtToEquity > 1.0) {
    risks.push(`High debt-to-equity ratio of ${metrics.debtToEquity.toFixed(2)} indicates elevated financial leverage risk.`);
  }

  if (metrics.peRatio !== null && metrics.sectorPeRatio !== null && metrics.peRatio > metrics.sectorPeRatio * 1.5) {
    risks.push(`P/E ratio of ${metrics.peRatio.toFixed(1)} significantly exceeds sector average of ${metrics.sectorPeRatio.toFixed(1)}, suggesting potential overvaluation.`);
  }

  if (metrics.rsi14 !== null && metrics.rsi14 > 70) {
    risks.push(`RSI of ${metrics.rsi14.toFixed(0)} indicates overbought conditions; short-term pullback risk elevated.`);
  } else if (metrics.rsi14 !== null && metrics.rsi14 < 30) {
    risks.push(`RSI of ${metrics.rsi14.toFixed(0)} indicates oversold conditions; may signal underlying weakness.`);
  }

  if (metrics.operatingMargin !== null && metrics.operatingMargin < 5) {
    risks.push(`Low operating margin of ${metrics.operatingMargin.toFixed(1)}% leaves limited buffer against cost pressures.`);
  }

  if (metrics.revenueGrowthYoY !== null && metrics.revenueGrowthYoY < 0) {
    risks.push(`Revenue declined ${Math.abs(metrics.revenueGrowthYoY).toFixed(1)}% year-over-year, signalling potential demand weakness.`);
  }

  if (metrics.profitGrowthYoY !== null && metrics.profitGrowthYoY < -10) {
    risks.push(`Profit declined ${Math.abs(metrics.profitGrowthYoY).toFixed(1)}% year-over-year, indicating deteriorating earnings quality.`);
  }

  // Always provide at least one general risk factor
  if (risks.length === 0) {
    if (totalScore >= 80) {
      risks.push('High valuation expectations may limit further upside if earnings disappoint.');
    } else if (totalScore >= 45) {
      risks.push('Market conditions and sector-specific risks may impact near-term performance.');
    } else {
      risks.push('Weak fundamental metrics suggest elevated investment risk across multiple dimensions.');
    }
  }

  return risks;
}

function generateShortTermOutlook(
  technical: CategoryResult,
  sentiment: CategoryResult,
  grade: AIGrade
): string {
  const avgScore = Math.round((technical.score + sentiment.score) / 2);

  if (avgScore >= 75) {
    return `Short-term outlook is positive. Technical indicators and market sentiment both support upward momentum. Grade: ${grade}.`;
  }
  if (avgScore >= 50) {
    return `Short-term outlook is neutral to cautiously positive. Technical positioning is balanced, and sentiment indicators suggest measured optimism. Grade: ${grade}.`;
  }
  if (avgScore >= 30) {
    return `Short-term outlook is cautious. Technical signals show mixed momentum, and sentiment is subdued. Investors may consider waiting for clearer signals. Grade: ${grade}.`;
  }
  return `Short-term outlook is negative. Technical weakness and poor sentiment suggest potential further downside. Risk management is advisable. Grade: ${grade}.`;
}

function generateLongTermOutlook(
  valuation: CategoryResult,
  growth: CategoryResult,
  profitability: CategoryResult,
  grade: AIGrade
): string {
  const avgScore = Math.round((valuation.score + growth.score + profitability.score) / 3);

  if (avgScore >= 75) {
    return `Long-term outlook is strongly positive. Attractive valuation, robust growth trajectory, and solid profitability metrics support sustained value creation. Grade: ${grade}.`;
  }
  if (avgScore >= 55) {
    return `Long-term outlook is positive. Reasonable valuation combined with adequate growth and profitability provides a favourable risk-reward profile. Grade: ${grade}.`;
  }
  if (avgScore >= 35) {
    return `Long-term outlook is neutral. Fundamental metrics present a mixed picture, and the stock may require a catalyst to unlock value. Grade: ${grade}.`;
  }
  return `Long-term outlook is challenging. Weak fundamentals across valuation, growth, or profitability suggest limited upside potential and elevated downside risk. Grade: ${grade}.`;
}
