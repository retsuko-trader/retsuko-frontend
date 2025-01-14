import { RawBacktestRun } from './BacktestRun';
import { RawBacktestSingle } from './BacktestSingle';
import { Candle } from './Candle';
import { RawDatasetGroup } from './DatasetGroup';

export interface Tables {
  backtestRun: RawBacktestRun;
  backtestSingle: RawBacktestSingle;
  candle: Candle;
  datasetGroup: RawDatasetGroup;
}

export * from './BacktestRun';
export * from './BacktestSingle';
export * from './Candle';
export * from './DatasetGroup';
