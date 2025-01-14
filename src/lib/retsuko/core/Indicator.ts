import { Candle } from '../tables';

export interface Indicator {
  name: string;
  ready: boolean;
  value: number;
  update(candle: Candle): void;
}