import { Market } from './Dataset';

export interface DatasetConfig {
  market: Market;
  symbolId: number;
  interval: number;
  start: string;
  end: string;
}

export namespace DatasetConfig {
  export function alias(config: DatasetConfig): string {
    return `${config.market}-${config.symbolId}-${config.interval}`;
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
