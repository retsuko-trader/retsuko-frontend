export interface BacktestTrade {
  backtestSingleId: string;
  ts: Date;
  action: 'buy' | 'sell';
  confidence: number;
  asset: number;
  currency: number;
  price: number;

  profit: number;
}
