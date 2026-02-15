import { z } from 'zod';

// --- Stock Overview ---

const StockOverviewSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  currentPrice: z.number().nullable(),
  previousClose: z.number().nullable(),
  open: z.number().nullable(),
  dayHigh: z.number().nullable(),
  dayLow: z.number().nullable(),
  weekHigh52: z.number().nullable(),
  weekLow52: z.number().nullable(),
  marketCap: z.number().nullable(),
  peRatio: z.number().nullable(),
  pbRatio: z.number().nullable(),
  dividendYield: z.number().nullable(),
  volume: z.number().nullable(),
  eps: z.number().nullable(),
  beta: z.number().nullable(),
  timestamp: z.string(),
});

const CompanyProfileSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  ipoDate: z.string().nullable(),
  ceo: z.string().nullable(),
  fullTimeEmployees: z.number().nullable(),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
  country: z.string(),
  exchange: z.string(),
  description: z.string().nullable(),
  website: z.string().nullable(),
});

const NewsArticleSchema = z.object({
  headline: z.string(),
  source: z.string(),
  date: z.string(),
  url: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

const DevelopmentSchema = z.object({
  headline: z.string(),
  publication: z.string(),
  date: z.string(),
  description: z.string().nullable(),
});

const KeyIssueSchema = z.object({
  topic: z.string(),
  bullishView: z.object({
    summary: z.string(),
    rationale: z.string(),
    sourceCount: z.number(),
  }),
  bearishView: z.object({
    summary: z.string(),
    rationale: z.string(),
    sourceCount: z.number(),
  }),
});

export const OverviewResponseSchema = z.object({
  overview: StockOverviewSchema,
  profile: CompanyProfileSchema,
  news: z.array(NewsArticleSchema),
  developments: z.array(DevelopmentSchema),
  keyIssues: z.array(KeyIssueSchema),
});

// --- Financials ---

const FinancialRowSchema = z.object({
  label: z.string(),
  values: z.record(z.string(), z.number().nullable()),
});

export const FinancialsResponseSchema = z.object({
  type: z.enum(['key-stats', 'income-statement', 'balance-sheet', 'cash-flow']),
  period: z.enum(['annual', 'quarterly', 'ttm']),
  dates: z.array(z.string()),
  currency: z.string(),
  rows: z.array(FinancialRowSchema),
});

// --- Earnings ---

const EarningsQuarterSchema = z.object({
  quarter: z.string(),
  date: z.string().nullable(),
  epsEstimate: z.number().nullable(),
  epsActual: z.number().nullable(),
  epsSurprise: z.number().nullable(),
  revenueEstimate: z.number().nullable(),
  revenueActual: z.number().nullable(),
  revenueSurprise: z.number().nullable(),
});

export const EarningsResponseSchema = z.object({
  quarters: z.array(EarningsQuarterSchema),
});

// --- Historical ---

const HistoricalDataPointSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export const HistoricalResponseSchema = z.object({
  data: z.array(HistoricalDataPointSchema),
});

// --- Scoring Metrics ---

export const ScoringMetricsSchema = z.object({
  valuation: z.object({
    peRatio: z.number().nullable(),
    forwardPE: z.number().nullable(),
    pbRatio: z.number().nullable(),
    psRatio: z.number().nullable(),
    evToEbitda: z.number().nullable(),
    pegRatio: z.number().nullable(),
    dividendYield: z.number().nullable(),
    sectorAvgPE: z.number().nullable(),
    intrinsicValueEstimate: z.number().nullable(),
  }),
  growth: z.object({
    revenueGrowthYoY: z.number().nullable(),
    revenueGrowth3Y: z.number().nullable(),
    epsGrowthYoY: z.number().nullable(),
    epsGrowth3Y: z.number().nullable(),
    netIncomeGrowthYoY: z.number().nullable(),
    bookValueGrowth: z.number().nullable(),
    futureRevenueGrowthEstimate: z.number().nullable(),
    futureEPSGrowthEstimate: z.number().nullable(),
  }),
  profitability: z.object({
    grossMargin: z.number().nullable(),
    operatingMargin: z.number().nullable(),
    netMargin: z.number().nullable(),
    roe: z.number().nullable(),
    roa: z.number().nullable(),
    roic: z.number().nullable(),
    freeCashFlowMargin: z.number().nullable(),
  }),
  technical: z.object({
    rsi14: z.number().nullable(),
    sma50: z.number().nullable(),
    sma200: z.number().nullable(),
    priceVsSMA50: z.number().nullable(),
    priceVsSMA200: z.number().nullable(),
    beta: z.number().nullable(),
    avgVolume30D: z.number().nullable(),
    relativeVolume: z.number().nullable(),
  }),
  sentiment: z.object({
    analystRating: z.string().nullable(),
    analystTargetPrice: z.number().nullable(),
    numberOfAnalysts: z.number().nullable(),
    insiderBuyingLast3M: z.number().nullable(),
    institutionalOwnership: z.number().nullable(),
    promoterHolding: z.number().nullable(),
    promoterPledge: z.number().nullable(),
    newsScore: z.number().nullable(),
  }),
});

// --- Score Reasoning ---

export const ScoreReasoningSchema = z.object({
  valuationAnalysis: z.string(),
  financialHealthAnalysis: z.string(),
  growthOutlook: z.string(),
  riskFactors: z.array(z.string()),
  shortTermOutlook: z.string(),
  longTermOutlook: z.string(),
  sentimentSummary: z.string(),
});

// --- Search Results ---

const SearchResultSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  sector: z.string().optional(),
});

export const searchResultsSchema = z.array(SearchResultSchema);

// Export types inferred from schemas
export type OverviewResponse = z.infer<typeof OverviewResponseSchema>;
export type FinancialsResponse = z.infer<typeof FinancialsResponseSchema>;
export type EarningsResponse = z.infer<typeof EarningsResponseSchema>;
export type HistoricalResponse = z.infer<typeof HistoricalResponseSchema>;
export type ScoringMetrics = z.infer<typeof ScoringMetricsSchema>;
export type ScoreReasoning = z.infer<typeof ScoreReasoningSchema>;
