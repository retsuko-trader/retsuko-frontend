import { Strategy, StrategyConfig } from '../strategy';
import { StochRSIStrategy } from './stochRsi';

export interface StrategyEntry {
  name: string;
  entry: new (name: string, config: StrategyConfig) => Strategy<StrategyConfig>;
  config: StrategyConfig;
}

function createEntry<TConfig extends StrategyConfig, TStrategy extends Strategy<TConfig>>(options: {
  name: string;
  entry: new (name: string, config: TConfig) => TStrategy;
  config: TConfig;
}): StrategyEntry {
  return options as unknown as StrategyEntry;
};

export const StrategyEntries: StrategyEntry[] = [
  createEntry({
    name: 'StochRSI',
    entry: StochRSIStrategy,
    config: {
      weight: 3,
      low: 20,
      high: 80,
      persistence: 3,
      reversed: 0,
    },
  }),
];