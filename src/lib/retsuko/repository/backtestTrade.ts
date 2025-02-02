import { db } from '@/lib/db/duckdb';
import { Trade } from '../core/Trade';
import { BacktestTrade } from '../tables/BacktestTrade';

export async function createBacktestTrades(
  backtestSingleId: string,
  trades: Trade[],
): Promise<void> {
  const values = trades.map((trade) => ({
    backtestSingleId,
    ts: trade.ts,
    action: trade.action,
    confidence: trade.confidence,
    asset: trade.asset,
    currency: trade.currency,
    price: trade.price,
    profit: trade.profit,
  }));

  await db.insertInto('backtestTrade')
    .values(values)
    .onConflict(ctx => ctx.doNothing())
    .execute();
}

export async function getBacktestTrades(backtestSingleId: string): Promise<BacktestTrade[]> {
  const trades = await db.selectFrom('backtestTrade')
    .selectAll()
    .where('backtestSingleId', '=', backtestSingleId)
    .execute();

  return trades;
}

export async function getBacktestTradesBalancesSampled(backtestSingleId: string, options?: {
  count?: number;
}): Promise<number[]> {
  const trades = await db.selectFrom('backtestTrade')
    .selectAll()
    .where('backtestSingleId', '=', backtestSingleId)
    .orderBy('ts')
    .execute();

  if (trades.length <= 0) {
    return [];
  }
  if (trades.length <= 1) {
    return [trades[0].asset * trades[0].price + trades[0].currency];
  }

  const balances: number[] = [];

  const startTs = trades[0].ts.getTime();
  const endTs = trades[trades.length - 1].ts.getTime();
  const count = options?.count ?? 100;
  const interval = (endTs - startTs) / count;

  let ts = startTs;
  for (const trade of trades) {
    if (trade.ts.getTime() >= ts) {
      balances.push(trade.asset * trade.price + trade.currency);
      ts += interval;
    }
  }

  return balances;
}

export async function removeBacktestTrades(backtestSingleId: string): Promise<void> {
  await db.deleteFrom('backtestTrade')
    .where('backtestSingleId', '=', backtestSingleId)
    .execute();
}

