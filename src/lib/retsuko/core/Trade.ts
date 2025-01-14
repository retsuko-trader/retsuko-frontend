export interface Trade {
  ts: Date;
  action: 'buy' | 'sell';
  asset: number;
  currency: number;
  price: number;

  profit: number;
}