import { Candle } from '../tables';
import { Portfolio } from './Portfolio';
import { Serializable } from './serializable';
import { Trade } from './Trade';

export interface Trader extends Serializable {
  handleAdvice(candle: Candle, direction: 'long' | 'short'): Promise<Trade | null>;

  getPortfolio(): Promise<Portfolio>;

  serialize(): string;
  deserialize(data: string): void;
}