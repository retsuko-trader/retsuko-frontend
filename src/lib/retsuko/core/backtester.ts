import {
  createBacktestRun,
  createBacktestSingle,
  getDatasetGroupById,
  updateBacktestRunEndsAt,
} from '../repository';
import { DatasetConfig } from '../tables';
import { SingleBacktester } from './singleBacktester';
import { StrategyEntries, StrategyEntry } from './strategies';

export interface BacktestConfig {
  datasetGroupId: number;
  strategyVariants: Array<{
    name: string;
    config: Record<string, number>;
  }>;
  trader: {
    balanceInitial: number;
    fee: number;
  };
}

export class Backtester {
  constructor(
    private readonly config: BacktestConfig,
  ) { }

  $datasets: DatasetConfig[] = [];
  $strategies: StrategyEntry[] = [];
  $runId: string | null = null;

  public async init(): Promise<boolean> {
    const datasetGroup = await getDatasetGroupById(this.config.datasetGroupId);

    if (!datasetGroup) {
      return false;
    }

    const strategies = this.config.strategyVariants.map(x => ({
      ...StrategyEntries.find(y => y.name === x.name),
      config: x.config,
    }));
    if (strategies.some(x => !x)) {
      return false;
    }

    this.$datasets = datasetGroup.datasets;
    this.$strategies = strategies as StrategyEntry[];

    this.$runId = await createBacktestRun({
      createdAt: new Date(),
      endedAt: null,
      datasetGroupId: datasetGroup.id,
      datasets: datasetGroup.datasets,
      strategyVariants: this.config.strategyVariants,
      tradeOptions: this.config.trader,
    });

    return true;
  }

  public async run() {
    if (this.$runId === null) {
      return;
    }

    for (const dataset of this.$datasets) {
      for (const strategy of this.$strategies) {
        const backtesterSingle = new SingleBacktester({
          dataset,
          strategy,
          trader: this.config.trader,
        });

        await backtesterSingle.init();
        await backtesterSingle.run();
        const report = backtesterSingle.report();

        if (!report) {
          console.error('failed to run backtestSingle for:', dataset.alias, strategy.name);
          continue;
        }

        await createBacktestSingle({
          runId: this.$runId,
          dataset,
          strategy,
          result: {
            balanceInitial: report.startBalance,
            balanceFinal: report.endBalance,
            profit: report.profit,
            tradesCount: report.trades.length,
            tradesWin: report.trades.filter(x => x.profit > 0).length,
            tradesLoss: report.trades.filter(x => x.profit < 0).length,
            avgTradeProfit: report.trades.length === 0 ? 0 : report.trades.reduce((acc, x) => acc + x.profit, 0) / report.trades.length,
          }
        });
      }
    }

    await updateBacktestRunEndsAt(this.$runId);
  }
}