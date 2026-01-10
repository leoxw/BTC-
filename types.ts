
export interface PriceDataPoint {
  timestamp: number;
  price: number;
  formattedTime: string;
}

export interface MarketStats {
  currentPrice: number;
  high24h: number;
  low24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
}

export enum TimeRange {
  DAY = '1',
  WEEK = '7',
  MONTH = '30',
  YEAR = '365',
  MAX = 'max'
}

export interface NewsEvent {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}
