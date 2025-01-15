import { Candle } from '../tables';

export interface Indicator {
  name: string;
  ready: boolean;
  value: number;
  update(candle: Candle): void;

  serialize(): string;
  deserialize(data: string): void;
}