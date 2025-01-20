import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db/duckdb';
import { BacktestRun, BacktestRunGroup, BacktestSingle, RawBacktestRun, RawBacktestSingle } from '../tables';
import { sortDatasetAlias } from '@/lib/helper';

function convertRunToRaw(row: BacktestRun): RawBacktestRun {
  return {
    id: row.id,
    createdAt: row.createdAt,
    endedAt: row.endedAt,
    datasetGroupId: row.datasetGroupId,
    datasets: JSON.stringify(row.datasets),
    strategyVariants: JSON.stringify(row.strategyVariants),
    balanceInitial: row.tradeOptions.initialBalance,
    fee: row.tradeOptions.fee,
    enableMargin: row.tradeOptions.enableMargin,
    validTradeOnly: row.tradeOptions.validTradeOnly,
  };
}

function convertRawToRun(row: RawBacktestRun): BacktestRun {
  return {
    id: row.id,
    createdAt: row.createdAt,
    endedAt: row.endedAt,
    datasetGroupId: row.datasetGroupId,
    datasets: JSON.parse(row.datasets),
    strategyVariants: JSON.parse(row.strategyVariants),
    tradeOptions: {
      initialBalance: row.balanceInitial,
      fee: row.fee,
      enableMargin: row.enableMargin,
      marginTradeAllWhenDirectionChanged: true,
      validTradeOnly: row.validTradeOnly,
    },
  };
}

function convertSingleToRaw(row: BacktestSingle): RawBacktestSingle {
  return {
    id: row.id,
    runId: row.runId,
    datasetAlias: row.dataset.alias,
    datasetStart: row.dataset.start,
    datasetEnd: row.dataset.end,
    strategyName: row.strategy.name,
    strategyConfigRaw: JSON.stringify(row.strategy.config),
    balanceInitial: row.result.balanceInitial,
    balanceFinal: row.result.balanceFinal,
    profit: row.result.profit,
    tradesCount: row.result.tradesCount,
    tradesWin: row.result.tradesWin,
    tradesLoss: row.result.tradesLoss,
    avgTradeProfit: row.result.avgTradeProfit,
    metricsRaw: JSON.stringify(row.metrics),
  };
}

function convertRawToSingle(row: RawBacktestSingle): BacktestSingle {
  return {
    id: row.id,
    runId: row.runId,
    dataset: {
      alias: row.datasetAlias,
      start: row.datasetStart,
      end: row.datasetEnd,
    },
    strategy: {
      name: row.strategyName,
      config: JSON.parse(row.strategyConfigRaw),
    },
    result: {
      balanceInitial: row.balanceInitial,
      balanceFinal: row.balanceFinal,
      profit: row.profit,
      tradesCount: row.tradesCount,
      tradesWin: row.tradesWin,
      tradesLoss: row.tradesLoss,
      avgTradeProfit: row.avgTradeProfit,
    },
    metrics: JSON.parse(row.metricsRaw),
  };
}

export async function getBacktests(): Promise<BacktestRun[]> {
  const resp = await db.selectFrom('backtestRun')
    .selectAll()
    .orderBy('createdAt', 'desc')
    .execute();

  return resp.map(convertRawToRun);
}

export async function getBacktestRunGroup(id: string): Promise<BacktestRunGroup | null> {
  const run = await db.selectFrom('backtestRun')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!run) {
    return null;
  }
  const runResult = convertRawToRun(run);

  const singles = await db.selectFrom('backtestSingle')
    .selectAll()
    .where('runId', '=', id)
    .execute();

  return {
    run: runResult,
    singles: singles.map(convertRawToSingle).sort((a, b) => {
      const strategyIndexA = runResult.strategyVariants.findIndex(x => (
        x.name === a.strategy.name && JSON.stringify(x.config) === JSON.stringify(a.strategy.config)
      ));
      const strategyIndexB = runResult.strategyVariants.findIndex(x => (
        x.name === b.strategy.name && JSON.stringify(x.config) === JSON.stringify(b.strategy.config)
      ));

      if (strategyIndexA !== strategyIndexB) {
        return strategyIndexA - strategyIndexB;
      }

      return sortDatasetAlias(a.dataset.alias, b.dataset.alias)
    }),
  };
}

export async function createBacktestRun(run: Omit<BacktestRun, 'id'>): Promise<string> {
  const id = createId();
  await db.insertInto('backtestRun')
    .values(convertRunToRaw({
      ...run,
      id,
    }))
    .execute();

  return id;
}

export async function createBacktestSingle(single: Omit<BacktestSingle, 'id'>): Promise<string> {
  const id = createId();
  await db.insertInto('backtestSingle')
    .values(convertSingleToRaw({
      ...single,
      id,
    }))
    .execute();

  return id;
}

export async function updateBacktestRunEndsAt(id: string): Promise<void> {
  await db.updateTable('backtestRun')
    .set({
      endedAt: new Date(),
    })
    .where('id', '=', id)
    .execute();
}

export async function deleteBacktestRun(id: string): Promise<void> {
  await db.deleteFrom('backtestRun')
    .where('id', '=', id)
    .execute();

  await db.deleteFrom('backtestSingle')
    .where('runId', '=', id)
    .execute();
}
