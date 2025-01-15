import { Strategy, StrategyConfig } from '../strategy';
import { RbbAdxBb } from './rbbAdxBb';
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
  createEntry({
    name: 'RbbAdxBb',
    entry: RbbAdxBb,
    config: {
      smaLong: 1000,
      smaShort: 50,
      bullHigh: 85.6,
      bullLow: 42.3,
      bullModHigh: 3.2,
      bullModLow: -9,
      bullRsi: 14.6,
      bearHigh: 60.4,
      bearLow: 28.2,
      bearModHigh: 1.4,
      bearModLow: -1.5,
      bearRsi: 10.5,
      adx: 3,
      adxHigh: 70,
      adxLow: 50,
      bbandNbDevDn: 2,
      bbandNbDevUp: 2,
      bbandTimePeriod: 20,
      bbtrendUpperThreshold: 50,
      bbtrendLowerThreshold: 50,
      bbtrendPersistence: 15,
    },
  })
];

export const StrategyEntriesLight = StrategyEntries.map(x => ({
  name: x.name,
  config: x.config,
}));

export function createStrategy(name: string, config: StrategyConfig): Strategy<StrategyConfig> | null {
  const entry = StrategyEntries.find(x => x.name === name);
  if (!entry) {
    return null;
  }

  return new entry.entry(name, config);
}