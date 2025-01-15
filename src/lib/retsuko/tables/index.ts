import { RawBacktestRun } from './BacktestRun';
import { RawBacktestSingle } from './BacktestSingle';
import { Candle } from './Candle';
import { RawDatasetGroup } from './DatasetGroup';
import { MarketPaperTrade, MarketPaperTraderState } from './MarketPaperTrade';

export interface Tables {
  backtestRun: RawBacktestRun;
  backtestSingle: RawBacktestSingle;
  candle: Candle;
  datasetGroup: RawDatasetGroup;
  marketPaperTraderState: MarketPaperTraderState;
  marketPaperTrade: MarketPaperTrade;
}

export * from './BacktestRun';
export * from './BacktestSingle';
export * from './Candle';
export * from './DatasetGroup';
