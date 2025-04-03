import { StrategyConfig } from './BacktestConfig';
import { Market } from './Dataset'

export interface LiveTraderCreateConfig {
  name: string;
  description: string;
}

export interface LiveTraderDatasetConfig {
  market: Market;
  symbolId: number;
  interval: number;
  preloadCount: number;
}

export interface LiveTraderBrokerConfig {
  isTestNet: boolean;
  leverage: number;
  ratio: number;
}

export interface LiveTraderConfig {
  info: LiveTraderCreateConfig;
  dataset: LiveTraderDatasetConfig;
  strategy: StrategyConfig;
  broker: LiveTraderBrokerConfig;
}
