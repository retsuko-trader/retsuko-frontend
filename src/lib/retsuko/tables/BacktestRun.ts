import { PaperTraderOptions } from '../core/paperTrader';
import type { BacktestSingle } from './BacktestSingle';
import { DatasetConfig } from './DatasetGroup';

export interface BacktestRun {
  id: string;
  createdAt: Date;
  endedAt: Date | null;
  datasetGroupId: number;
  datasets: DatasetConfig[];

  strategyVariants: Array<{
    name: string;
    config: Record<string, number>;
  }>;

  tradeOptions: PaperTraderOptions;
}

export interface RawBacktestRun {
  id: string;
  createdAt: Date;
  endedAt: Date | null;

  datasetGroupId: number;
  datasets: string;

  strategyVariants: string;

  balanceInitial: number;
  fee: number;
  enableMargin: boolean;
  makeValidTradeOnly: boolean;
}

export interface BacktestRunGroup {
  run: BacktestRun;
  singles: BacktestSingle[];
}