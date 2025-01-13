export interface Candle {
  source: string;
  interval: string;
  symbol: string;
  ts: Date;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}