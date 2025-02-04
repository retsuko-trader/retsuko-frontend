import { Strategy, StrategyConfig } from '../strategy';
import { BestoneStrategy } from './bestone';
import { EmaHeikinAshiStrategy } from './emaHeikinAshi';
import { MichaelHarrisDaxStrategy } from './michaelHarrisDax';
import { MinMaxStrategy } from './minmax';
import { NeoStrategy } from './neo';
import { PoincareStrategy } from './poincare';
import { RaynerTeosStrategy } from './raynerTeos';
import { RbbAdxBbStrategy } from './rbbAdxBb';
import { SimpleRsiStrategy } from './simpleRsi';
import { StochRSIStrategy } from './stochRsi';
import { SuperTrendStrategy } from './superTrend';
import { SuperTrendTurtleStrategy } from './superTrendTurtle';
import { TurtleStrategy } from './turtle';
import { TurtleRegimeStrategy } from './turtleRegime';

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
    name: 'TurtleRegime',
    entry: TurtleRegimeStrategy,
    config: {
      enterFast: 20,
      exitFast: 10,
      enterSlow: 55,
      exitSlow: 20,
      bullPeriod: 50,
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
      trailingStop: 3.5,
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
  createEntry({
    name: 'SimpleRSI',
    entry: SimpleRsiStrategy,
    config: {
      rsiTimePeriod: 5,
      rsiHigh: 70,
      rsiLow: 70,
    },
  }),
  createEntry({
    name: 'MinMax',
    entry: MinMaxStrategy,
    config: {
      window: 10,
    },
  }),
  createEntry({
    name: 'Poincare',
    entry: PoincareStrategy,
    config: {
      window: 25,
      bandWindow: 10,
      bandFactor: 2.5,
      lowerIbs: 0.3,
    },
  }),
  createEntry({
    name: 'SuperTrendTurtle',
    entry: SuperTrendTurtleStrategy,
    config: {
      atrPeriod: 7,
      bandFactor: 3,
      trailingStop: 3.5,
      enterFast: 20,
      exitFast: 10,
      enterSlow: 55,
      exitSlow: 20,
      bullPeriod: 50,
    },
  }),
  createEntry({
    name: 'michaelHarrisDax',
    entry: MichaelHarrisDaxStrategy,
    config: {
      window: 5,
      delay: 0,
      buyAlgorithm: 0,
      sellAlgorithm: 1,
      trailingStop: 15,
    },
  }),
  createEntry({
    name: 'raynerTeos',
    entry: RaynerTeosStrategy,
    config: {
      window: 20,
      smaShort: 20,
      smaLong: 200,
      rsiPeriod: 2,
    },
  }),
  createEntry({
    name: 'emaHeikinAshi',
    entry: EmaHeikinAshiStrategy,
    config: {
      emaPeriod: 5,
      ema2Period: 5,
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
