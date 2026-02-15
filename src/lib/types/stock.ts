export interface StockOverview {
  ticker: string;
  companyName: string;
  currentPrice: number | null;
  previousClose: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  dividendYield: number | null;
  volume: number | null;
  eps: number | null;
  beta: number | null;
  timestamp: string;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  ipoDate: string | null;
  ceo: string | null;
  fullTimeEmployees: number | null;
  sector: string | null;
  industry: string | null;
  country: string;
  exchange: string;
  description: string | null;
  website: string | null;
}

export interface NewsArticle {
  headline: string;
  source: string;
  date: string;
  url: string | null;
  imageUrl: string | null;
}

export interface Development {
  headline: string;
  publication: string;
  date: string;
  description: string | null;
}

export interface KeyIssue {
  topic: string;
  bullishView: {
    summary: string;
    rationale: string;
    sourceCount: number;
  };
  bearishView: {
    summary: string;
    rationale: string;
    sourceCount: number;
  };
}

export interface StockOverviewResponse {
  overview: StockOverview;
  profile: CompanyProfile;
  news: NewsArticle[];
  developments: Development[];
  keyIssues: KeyIssue[];
}
