import { PaperBrokerConfig, StrategyConfig } from './BacktestConfig';
import { Market } from './Dataset';

export interface PapertraderDatasetConfig {
  market: Market;
  symbolId: number;
  interval: number;
  preloadCount: number;
}

export interface PapoertraderCreateConfig {
  name: string;
  description: string;
}

export interface PapertraderConfig {
  info: PapoertraderCreateConfig;
  dataset: PapertraderDatasetConfig;
  strategy: StrategyConfig;
  broker: PaperBrokerConfig;
}
