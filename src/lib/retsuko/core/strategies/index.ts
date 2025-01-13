import { Strategy, StrategyConfig } from '../strategy';
import { StochRSIStrategy } from './stochRsi';

function createEntry<TConfig extends StrategyConfig, TStrategy extends Strategy<TConfig>>(options: {
  name: string;
  entry: new (name: string, config: TConfig) => TStrategy;
  config: TConfig;
}) {
  return options;
};

export const StrategyEntries = [
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