import { Strategy, StrategyConfig } from '../strategy';
import { BestoneStrategy } from './bestone';
import { NeoStrategy } from './neo';
import { RbbAdxBbStrategy } from './rbbAdxBb';
import { StochRSIStrategy } from './stochRsi';
import { SuperTrendStrategy } from './superTrend';
import { TurtleStrategy } from './turtle';

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
    entry: RbbAdxBbStrategy,
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
  }),
  createEntry({
    name: 'Turtle',
    entry: TurtleStrategy,
    config: {
      enterFast: 20,
      exitFast: 10,
      enterSlow: 55,
      exitSlow: 20,
      trailingStop: 15,
    },
  }),
  createEntry({
    name: 'bestone',
    entry: BestoneStrategy,
    config: {
      macdFastPeriod: 12,
      macdSlowPeriod: 26,
      macdSignalPeriod: 9,
      emaShortTimePeriod: 9,
      emaLongTimePeriod: 21,
      stochFastKPeriod: 9,
      stochSlowKPeriod: 3,
      stochSlowDPeriod: 3,
      rsiTimePeriod: 14.1,
      rsiHigh: 70,
      rsiLow: 30,
      historySize: 48,
    },
  }),
  createEntry({
    name: 'superTrend',
    entry: SuperTrendStrategy,
    config: {
      atrPeriod: 7,
      bandFactor: 3,
    },
  }),
  createEntry({
    name: 'NEO',
    entry: NeoStrategy,
    config: {
      smaLong: 150,
      smaShort: 40,
      bullRsi: 10,
      bullRsiHigh: 80,
      bullRsiLow: 50,
      idleRsi: 12,
      idleRsiHigh: 65,
      idleRsiLow: 39,
      bearRsi: 15,
      bearRsiHigh: 50,
      bearRsiLow: 25,
      roc: 6,
      rocLvl: 0,
    },
  }),
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
