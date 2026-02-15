import type { FinancialPeriod } from '@/lib/types/financial';
import type { HistoricalRange } from '@/lib/types/financial';

const SYSTEM_PROMPT = `You are a financial data API for Indian NSE (National Stock Exchange) stocks. Always respond with valid JSON only. No markdown, no explanation text, no code fences. Just raw JSON.`;

export { SYSTEM_PROMPT };

/**
 * Build prompt for stock search queries.
 */
export function buildSearchPrompt(query: string): string {
  return `Search for NSE India stocks matching "${query}". Return a JSON array of matching stocks. Each item must have "ticker" (NSE symbol) and "companyName" fields. Return at most 10 results. Example: [{"ticker":"RELIANCE","companyName":"Reliance Industries Ltd"}]. Return ONLY the JSON array, no other text.`;
}

/**
 * Build prompt for stock overview data.
 */
export function buildOverviewPrompt(ticker: string): string {
  return `Provide comprehensive current data for the NSE India stock "${ticker}". Return a JSON object with these exact fields:

{
  "overview": {
    "ticker": "${ticker}",
    "companyName": "Full company name",
    "currentPrice": number or null,
    "previousClose": number or null,
    "open": number or null,
    "dayHigh": number or null,
    "dayLow": number or null,
    "weekHigh52": number or null (52-week high in INR),
    "weekLow52": number or null (52-week low in INR),
    "marketCap": number or null (market cap in INR, full number not abbreviated),
    "peRatio": number or null (Price-to-Earnings ratio, trailing),
    "pbRatio": number or null (Price-to-Book ratio),
    "dividendYield": number or null (as percentage, e.g. 1.5 for 1.5%),
    "volume": number or null (today's trading volume),
    "eps": number or null (Earnings Per Share in INR, trailing 12 months),
    "beta": number or null,
    "timestamp": "ISO 8601 timestamp"
  },
  "profile": {
    "symbol": "${ticker}",
    "companyName": "Full company name",
    "ipoDate": "YYYY-MM-DD" or null,
    "ceo": "CEO name" or null,
    "fullTimeEmployees": number or null,
    "sector": "sector name" or null,
    "industry": "industry name" or null,
    "country": "India",
    "exchange": "NSE",
    "description": "Brief company description (2-3 sentences)" or null,
    "website": "https://..." or null
  },
  "news": [
    {
      "headline": "Recent headline",
      "source": "Source name",
      "date": "YYYY-MM-DD",
      "url": "https://..." or null,
      "imageUrl": null
    }
  ] (provide 5-8 recent news items),
  "developments": [
    {
      "headline": "Key development",
      "publication": "Source",
      "date": "YYYY-MM-DD",
      "description": "Brief description" or null
    }
  ] (provide 3-5 recent developments),
  "keyIssues": [
    {
      "topic": "Key issue topic",
      "bullishView": {
        "summary": "Bull case summary",
        "rationale": "Detailed rationale",
        "sourceCount": number
      },
      "bearishView": {
        "summary": "Bear case summary",
        "rationale": "Detailed rationale",
        "sourceCount": number
      }
    }
  ] (provide 2-4 key issues)
}

Use the most recent and accurate data available. All prices in INR. This is for NSE India (National Stock Exchange of India).`;
}

/**
 * Build prompt for financial statement data.
 */
export function buildFinancialsPrompt(ticker: string, period: FinancialPeriod): string {
  const periodLabel =
    period === 'annual'
      ? 'annual (last 4-5 fiscal years)'
      : period === 'quarterly'
        ? 'quarterly (last 4-6 quarters)'
        : 'trailing twelve months (TTM)';

  return `Provide ${periodLabel} financial data for the NSE India stock "${ticker}". Return a JSON object with these exact fields:

{
  "type": "income-statement",
  "period": "${period}",
  "dates": ["3/31/2024", "3/31/2023", ...] (fiscal year end dates for annual, or quarter end dates for quarterly),
  "currency": "INR",
  "rows": [
    { "label": "Revenue", "values": { "3/31/2024": 123456, "3/31/2023": 112233 } },
    { "label": "Cost of Revenue", "values": { ... } },
    { "label": "Gross Profit", "values": { ... } },
    { "label": "Gross Margin %", "values": { ... } },
    { "label": "Operating Expenses", "values": { ... } },
    { "label": "Operating Income", "values": { ... } },
    { "label": "Operating Margin %", "values": { ... } },
    { "label": "Net Income", "values": { ... } },
    { "label": "Net Margin %", "values": { ... } },
    { "label": "EPS (Basic)", "values": { ... } },
    { "label": "EPS (Diluted)", "values": { ... } },
    { "label": "EBITDA", "values": { ... } },
    { "label": "EBITDA Margin %", "values": { ... } },
    { "label": "Total Assets", "values": { ... } },
    { "label": "Total Liabilities", "values": { ... } },
    { "label": "Total Equity", "values": { ... } },
    { "label": "Total Debt", "values": { ... } },
    { "label": "Cash & Equivalents", "values": { ... } },
    { "label": "Debt to Equity", "values": { ... } },
    { "label": "Current Ratio", "values": { ... } },
    { "label": "Return on Equity %", "values": { ... } },
    { "label": "Return on Assets %", "values": { ... } },
    { "label": "Operating Cash Flow", "values": { ... } },
    { "label": "Capital Expenditure", "values": { ... } },
    { "label": "Free Cash Flow", "values": { ... } }
  ]
}

All monetary values should be in INR (Indian Rupees), full numbers (not in Cr or L). Use null for unavailable data points. Provide accurate financial data for ${ticker} listed on NSE India.`;
}

/**
 * Build prompt for earnings data.
 */
export function buildEarningsPrompt(ticker: string): string {
  return `Provide the last 8 quarterly earnings data for the NSE India stock "${ticker}". Return a JSON object with this exact structure:

{
  "quarters": [
    {
      "quarter": "Q3 '24",
      "date": "YYYY-MM-DD",
      "epsEstimate": number or null (analyst consensus EPS estimate in INR),
      "epsActual": number or null (actual reported EPS in INR),
      "epsSurprise": number or null (percentage surprise, e.g. 5.2 for 5.2% beat),
      "revenueEstimate": number or null (analyst consensus revenue estimate in INR),
      "revenueActual": number or null (actual reported revenue in INR),
      "revenueSurprise": number or null (percentage surprise)
    }
  ]
}

Order quarters from most recent to oldest. Use Indian fiscal quarter notation (Q1 = Apr-Jun, Q2 = Jul-Sep, Q3 = Oct-Dec, Q4 = Jan-Mar). All values in INR. Revenue should be the full number, not abbreviated. Use null for unavailable data.`;
}

/**
 * Build prompt for historical price data.
 */
export function buildHistoricalPrompt(ticker: string, range: HistoricalRange): string {
  const rangeDescription: Record<HistoricalRange, string> = {
    '1D': 'today (intraday data points every 15-30 minutes during market hours 9:15 AM - 3:30 PM IST)',
    '5D': 'the last 5 trading days (daily OHLCV)',
    '1M': 'the last 1 month (daily OHLCV)',
    '6M': 'the last 6 months (weekly OHLCV)',
    'YTD': 'year-to-date from January 1 (weekly OHLCV)',
    '1Y': 'the last 1 year (weekly OHLCV)',
    '5Y': 'the last 5 years (monthly OHLCV)',
    'MAX': 'all available history (monthly OHLCV, up to 20 years)',
  };

  return `Provide historical price data for the NSE India stock "${ticker}" for ${rangeDescription[range]}. Return a JSON object with this exact structure:

{
  "data": [
    {
      "date": "YYYY-MM-DD" (or "YYYY-MM-DD HH:mm" for intraday),
      "open": number,
      "high": number,
      "low": number,
      "close": number,
      "volume": number
    }
  ]
}

Order data points from oldest to newest. All prices in INR. Provide realistic and accurate price data for ${ticker} on NSE India.`;
}

/**
 * Build prompt for AI scoring metrics.
 */
export function buildScoringMetricsPrompt(ticker: string): string {
  return `Provide comprehensive scoring metrics for the NSE India stock "${ticker}" to evaluate as an investment. Return a JSON object with this exact structure:

{
  "valuation": {
    "peRatio": number or null,
    "forwardPE": number or null,
    "pbRatio": number or null,
    "psRatio": number or null,
    "evToEbitda": number or null,
    "pegRatio": number or null,
    "dividendYield": number or null (as percentage),
    "sectorAvgPE": number or null,
    "intrinsicValueEstimate": number or null (estimated fair value per share in INR)
  },
  "growth": {
    "revenueGrowthYoY": number or null (percentage),
    "revenueGrowth3Y": number or null (CAGR percentage),
    "epsGrowthYoY": number or null (percentage),
    "epsGrowth3Y": number or null (CAGR percentage),
    "netIncomeGrowthYoY": number or null (percentage),
    "bookValueGrowth": number or null (percentage),
    "futureRevenueGrowthEstimate": number or null (analyst consensus, percentage),
    "futureEPSGrowthEstimate": number or null (analyst consensus, percentage)
  },
  "profitability": {
    "grossMargin": number or null (percentage),
    "operatingMargin": number or null (percentage),
    "netMargin": number or null (percentage),
    "roe": number or null (percentage, Return on Equity),
    "roa": number or null (percentage, Return on Assets),
    "roic": number or null (percentage, Return on Invested Capital),
    "freeCashFlowMargin": number or null (percentage)
  },
  "technical": {
    "rsi14": number or null (Relative Strength Index),
    "sma50": number or null (50-day Simple Moving Average in INR),
    "sma200": number or null (200-day Simple Moving Average in INR),
    "priceVsSMA50": number or null (percentage above/below),
    "priceVsSMA200": number or null (percentage above/below),
    "beta": number or null,
    "avgVolume30D": number or null,
    "relativeVolume": number or null
  },
  "sentiment": {
    "analystRating": "Buy" | "Hold" | "Sell" | null,
    "analystTargetPrice": number or null (consensus target in INR),
    "numberOfAnalysts": number or null,
    "insiderBuyingLast3M": number or null (net insider buy value in INR),
    "institutionalOwnership": number or null (percentage),
    "promoterHolding": number or null (percentage),
    "promoterPledge": number or null (percentage of promoter holding pledged),
    "newsScore": number or null (1-10 based on recent news sentiment)
  }
}

Use the most recent and accurate data for ${ticker} from NSE India. Use null for any data point that is not available or cannot be reliably estimated.`;
}

/**
 * Build prompt for AI score reasoning/analysis.
 */
export function buildScoreReasoningPrompt(
  ticker: string,
  score: number,
  breakdown: Record<string, { score: number }>
): string {
  const breakdownSummary = Object.entries(breakdown)
    .map(([key, val]) => `${key}: ${val.score}/100`)
    .join(', ');

  return `You have scored the NSE India stock "${ticker}" with an overall AI score of ${score}/100. The category breakdown is: ${breakdownSummary}.

Provide detailed analysis reasoning. Return a JSON object with this exact structure:

{
  "valuationAnalysis": "2-4 sentence analysis of the stock's valuation relative to peers and historical averages",
  "financialHealthAnalysis": "2-4 sentence analysis of balance sheet strength, debt levels, and cash flow quality",
  "growthOutlook": "2-4 sentence analysis of revenue and earnings growth trajectory",
  "riskFactors": ["Risk factor 1", "Risk factor 2", "Risk factor 3", "Risk factor 4"] (provide 3-6 specific risk factors),
  "shortTermOutlook": "2-3 sentence outlook for the next 3-6 months",
  "longTermOutlook": "2-3 sentence outlook for the next 2-5 years",
  "sentimentSummary": "2-3 sentence summary of market sentiment, analyst views, and institutional interest"
}

Be specific, use actual numbers and comparisons where possible. Reference the stock's sector and Indian market context.`;
}
