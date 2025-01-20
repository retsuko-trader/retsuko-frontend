import { BacktestMetrics } from '../core/singleBacktester';
import { DatasetConfig } from './DatasetGroup';

export interface BacktestSingle {
  id: string;
  runId: string;

  dataset: DatasetConfig;

  strategy: {
    name: string;
    config: Record<string, number>;
  };

  result: {
    balanceInitial: number;
    balanceFinal: number;
    profit: number;
    tradesCount: number;
    tradesWin: number;
    tradesLoss: number;
    avgTradeProfit: number;
  };

  metrics: BacktestMetrics;
}

export interface RawBacktestSingle {
  id: string;
  runId: string;

  datasetAlias: string;
  datasetStart: Date;
  datasetEnd: Date;

  strategyName: string;
  strategyConfigRaw: string;

  balanceInitial: number;
  balanceFinal: number;
  profit: number;
  tradesCount: number;
  tradesWin: number;
  tradesLoss: number;
  avgTradeProfit: number;

  metricsRaw: string;
}
