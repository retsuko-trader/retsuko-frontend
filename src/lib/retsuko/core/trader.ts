import { Candle } from '../tables';
import { Portfolio } from './Portfolio';
import { Trade } from './Trade';

export interface Trader {
  handleAdvice(candle: Candle, direction: 'long' | 'short'): Promise<Trade | null>;

  getPortfolio(): Promise<Portfolio>;

  serialize(): string;
  deserialize(data: string): void;
}