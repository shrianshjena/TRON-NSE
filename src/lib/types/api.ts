export interface APIResponse<T> {
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface SearchResult {
  ticker: string;
  companyName: string;
  sector?: string;
}

export interface PopularTicker {
  ticker: string;
  companyName: string;
  searchCount: number;
  lastPrice: number | null;
  priceChangePct: number | null;
}
