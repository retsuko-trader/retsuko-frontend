import { Candle } from '../tables';
import { Serializable } from './serializable';

export interface Indicator extends Serializable {
  name: string;
  ready: boolean;
  value: number;
  update(candle: Candle): void;
}