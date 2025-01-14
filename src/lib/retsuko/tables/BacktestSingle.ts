export interface BacktestSingle {
  id: string;
  runId: string;

  dataset: {
    alias: string;
    start: Date;
    end: Date;
  };

  strategy: {
    name: string;
    config: Record<string, number>;
  };

  result: {
    balanceInitial: number;
    balanceFinal: number;
    profit: number;
    tradesWin: number;
    tradesLoss: number;
    avgTradeProfit: number;
  };
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
  tradesWin: number;
  tradesLoss: number;
  avgTradeProfit: number;
}
