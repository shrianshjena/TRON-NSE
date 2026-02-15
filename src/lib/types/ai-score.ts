export interface AIScoreBreakdown {
  valuation: { score: number; metrics: Record<string, number | string | null> };
  growth: { score: number; metrics: Record<string, number | string | null> };
  profitability: { score: number; metrics: Record<string, number | string | null> };
  technical: { score: number; metrics: Record<string, number | string | null> };
  sentiment: { score: number; metrics: Record<string, number | string | null> };
}

export type AIGrade = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
export type AIClassification = 'Bullish' | 'Neutral' | 'Bearish';

export interface AIScoreResult {
  score: number;
  classification: AIClassification;
  grade: AIGrade;
  breakdown: AIScoreBreakdown;
  confidence: number;
  valuationAnalysis: string;
  financialHealthAnalysis: string;
  growthOutlook: string;
  riskFactors: string[];
  shortTermOutlook: string;
  longTermOutlook: string;
  sentimentSummary: string;
  timestamp: string;
}
