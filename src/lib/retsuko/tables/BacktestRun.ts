import type { BacktestSingle } from './BacktestSingle';

export interface BacktestRun {
  id: string;
  createdAt: Date;
  datasetGroupId: number;
  datasets: Array<{
    alias: string;
    start: Date;
    end: Date;
  }>;

  strategyVariants: Array<{
    name: string;
    config: Record<string, number>;
  }>;

  tradeOptions: {
    balanceInitial: number;
    fee: number;
  };
}

export interface RawBacktestRun {
  id: string;
  createdAt: Date;

  datasetGroupId: number;
  datasets: string;

  strategyVariants: string;

  balanceInitial: number;
  fee: number;
}

export interface BacktestRunGroup {
  run: BacktestRun;
  singles: BacktestSingle[];
}