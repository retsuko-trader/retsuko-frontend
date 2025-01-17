import type { BinanceInterval } from '../binance';

export type Market = 'futures' | 'spot';

export interface Candle {
  market: Market;
  symbol: string;
  interval: BinanceInterval;
  ts: Date;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface SimpleCandle {
  ts: Date;
  close: number;
}