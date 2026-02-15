import { Metadata } from 'next';
import { StockPageClient } from '@/components/stock/stock-page-client';

interface StockPageProps {
  params: { ticker: string };
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const ticker = params.ticker.toUpperCase();
  return {
    title: `${ticker} - Stock Analysis | TRON NSE`,
    description: `Comprehensive financial analysis and AI-powered investment score for ${ticker} on NSE India.`,
    openGraph: {
      title: `${ticker} - TRON NSE`,
      description: `AI-powered equity analysis for ${ticker} on National Stock Exchange of India.`,
    },
  };
}

export default function StockPage({ params }: StockPageProps) {
  const ticker = params.ticker.toUpperCase();
  return <StockPageClient ticker={ticker} />;
}
