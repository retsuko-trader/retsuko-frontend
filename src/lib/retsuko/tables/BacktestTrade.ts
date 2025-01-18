export interface BacktestTrade {
  backtestSingleId: string;
  ts: Date;
  action: 'buy' | 'sell';
  asset: number;
  currency: number;
  price: number;

  profit: number;
}
