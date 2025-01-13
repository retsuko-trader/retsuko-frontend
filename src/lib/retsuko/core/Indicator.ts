import { Candle } from '../tables/candle';

export interface Indicator {
  name: string;
  ready: boolean;
  value: number;
  update(candle: Candle): void;
}