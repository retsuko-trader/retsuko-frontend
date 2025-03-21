import { Market } from './Dataset';

export interface Candle {
  market: Market;
  symbolId: number;
  interval: number;
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
