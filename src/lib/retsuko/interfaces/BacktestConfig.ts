import { Intervals } from '@/lib/helper/interval';
import { Market } from './Dataset';
import { Symbol } from './Symbol';

export interface DatasetConfig {
  market: Market;
  symbolId: number;
  interval: number;
  start: string;
  end: string;
}

export namespace DatasetConfig {
  export function alias(config: DatasetConfig, symbols: Symbol[]): string {
    const market = Market[config.market];
    const symbol = symbols.find(x => x.id === config.symbolId);
    const interval = Intervals[config.interval];
    return `${market}-${symbol?.name ?? config.symbolId}-${interval}`;
  }
}

export interface StrategyConfig {
  name: string;
  config: string;
}

export interface PaperBrokerConfig {
  initialBalance: number;
  fee: number;
  enableMargin: boolean;
  validTradeOnly: boolean;
}

export interface BacktestConfig {
  dataset: DatasetConfig;
  strategy: StrategyConfig;
  broker: PaperBrokerConfig;
}

export interface BulkBacktestConfig {
  name: string;
  description: string;
  datasets: DatasetConfig[];
  strategies: StrategyConfig[];
  broker: PaperBrokerConfig;
}
