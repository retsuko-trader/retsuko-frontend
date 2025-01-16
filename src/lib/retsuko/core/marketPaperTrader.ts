import { db } from '@/lib/db/duckdb';
import { Candle } from '../tables';
import { CandleLike } from './dataset';
import { subscribeWorkerStream } from './worker';
import { createId } from '@paralleldrive/cuid2';
import { createStrategy, StrategyEntries } from './strategies';
import { PaperTrader } from './paperTrader';
import { MarketPaperTrade, MarketPaperTraderModel, MarketPaperTraderState } from '../tables/MarketPaperTrade';
import { revalidatePath } from 'next/cache';

export interface CreateMarketPaperTraderConfig {
  name: string;
  description: string;
  input: CandleLike;
  strategy: {
    name: string;
    config: Record<string, number>;
  };
  trader: {
    balanceInitial: number;
    fee: number;
  };
}

function toModel(row: MarketPaperTraderState): MarketPaperTraderModel {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    endedAt: row.endedAt,
    symbol: row.symbol,
    interval: row.interval,
    strategyName: row.strategyName,
    strategyConfig: JSON.parse(row.strategyConfigRaw),
    strategySerialized: row.strategySerialized,
    trader: JSON.parse(row.traderSerialized),
  };
}

export async function getMarketPaperTraders(): Promise<MarketPaperTraderModel[]> {
  const resp = await db.selectFrom('marketPaperTraderState')
    .selectAll()
    .execute();

  return resp.map(toModel);
}

export async function getMarketPaperTraderById(traderId: string): Promise<MarketPaperTraderModel | null> {
  const resp = await db.selectFrom('marketPaperTraderState')
    .selectAll()
    .where('id', '=', traderId)
    .executeTakeFirst();

  return resp ? toModel(resp) : null;
}

export async function getMarketPaperTradesByTraderId(traderId: string): Promise<MarketPaperTrade[]> {
  const resp = await db.selectFrom('marketPaperTrade')
    .selectAll()
    .where('traderId', '=', traderId)
    .orderBy('ts', 'asc')
    .execute();

  return resp;
}

export async function createMarketPaperTrader(config: CreateMarketPaperTraderConfig): Promise<string | null> {
  const strategyEntry = StrategyEntries.find(x => x.name === config.strategy.name);
  if (!strategyEntry) {
    return null;
  }

  const strategy = new strategyEntry.entry(config.strategy.name, config.strategy.config);
  const trader = new PaperTrader(config.trader.balanceInitial, config.trader.fee);

  const resp = await db.insertInto('marketPaperTraderState')
    .values({
      id: createId(),
      name: config.name,
      description: config.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      endedAt: null,
      symbol: config.input.symbol,
      interval: config.input.interval,
      strategyName: config.strategy.name,
      strategyConfigRaw: JSON.stringify(config.strategy.config),
      strategySerialized: strategy.serialize(),
      traderSerialized: trader.serialize(),
    })
    .returning('id')
    .executeTakeFirst();

  await subscribeWorkerStream({
    market: 'futures',
    interval: config.input.interval,
    symbol: config.input.symbol,
  });

  return resp?.id ?? null;
}

export async function handleMarketPaperTradesCandle(candle: Candle) {
  const traders = await db.selectFrom('marketPaperTraderState')
    .selectAll()
    .where('endedAt', 'is', null)
    .where('symbol', '=', candle.symbol)
    .where('interval', '=', candle.interval)
    .execute();

  await Promise.all(traders.map(x => handleSingleCandle(x, candle)));
}

async function handleSingleCandle(trader: MarketPaperTraderState, candle: Candle) {
  const strategy = createStrategy(trader.strategyName, JSON.parse(trader.strategyConfigRaw));
  if (!strategy) {
    return false;
  }
  strategy?.deserialize(trader.strategySerialized);

  const paperTrader = new PaperTrader(0, 0);
  paperTrader.deserialize(trader.traderSerialized);

  const direction = await strategy.update(candle);

  revalidatePath('/retsuko/papertrade');

  if (direction) {
    const trade = await paperTrader.handleAdvice(candle, direction);
    if (trade) {
      await db.insertInto('marketPaperTrade')
        .values({
          id: createId(),
          traderId: trader.id,
          ts: new Date(),
          action: trade.action,
          asset: trade.asset,
          currency: trade.currency,
          price: candle.close,
          profit: null,
        })
        .execute();
    }
  }

  await db.updateTable('marketPaperTraderState')
    .set({
      updatedAt: new Date(),
      strategySerialized: strategy.serialize(),
      traderSerialized: paperTrader.serialize(),
    })
    .where('id', '=', trader.id)
    .execute();
}