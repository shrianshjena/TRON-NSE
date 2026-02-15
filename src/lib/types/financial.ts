export type FinancialPeriod = 'annual' | 'quarterly' | 'ttm';

export interface FinancialRow {
  label: string;
  values: Record<string, number | null>; // key = date like "3/31/2024"
}

export interface FinancialStatement {
  type: 'key-stats' | 'income-statement' | 'balance-sheet' | 'cash-flow';
  period: FinancialPeriod;
  dates: string[];
  rows: FinancialRow[];
  currency: string;
}

export interface EarningsData {
  quarters: EarningsQuarter[];
}

export interface EarningsQuarter {
  quarter: string; // e.g. "Q3 '24"
  date: string;
  epsEstimate: number | null;
  epsActual: number | null;
  epsSurprise: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  revenueSurprise: number | null;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type HistoricalRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';
