import type { Kysely } from 'kysely';
import { db } from '../db/duckdb';
import { BinanceInterval } from './binance';
import { Candle, Market } from './tables';

export type Dataset = {
  market: Market;
  symbol: string;
  interval: BinanceInterval;
  start: Date;
  end: Date;
  count: number;
};

export async function searchDatasets(options?: {
  market?: Market;
  symbol?: string;
  interval?: BinanceInterval;

  database?: Kysely<{ candle: Candle }>;
}): Promise<Dataset[]> {
  const { market, symbol, interval } = options ?? {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db0 = options?.database ?? db as any as Kysely<{ candle: Candle }>;
  let query = db0.selectFrom('candle')
    .select(({ fn }) => [
      'market',
      'interval',
      'symbol',
      fn.min('ts').as('start'),
      fn.max('ts').as('end'),
      fn.count('ts').as('count'),
    ])
    .groupBy(['market', 'symbol', 'interval'])
    .orderBy(['market', 'symbol', 'interval']);

  if (market) {
    query = query.where('market', '=', market);
  }
  if (symbol) {
    query = query.where('symbol', '=', symbol);
  }
  if (interval) {
    query = query.where('interval', '=', interval);
  }

  const resp = await query
    .$castTo<Dataset>()
    .execute();

  return resp;
}

export async function* getCandles(options: {
  market: Market;
  symbol: string;
  interval: BinanceInterval;
  start?: Date;
  end?: Date;
}) {
  const { market, symbol, interval, start, end } = options;

  // TODO: chunk optimize
  let query = db.selectFrom('candle')
    .selectAll()
    .where('market', '=', market)
    .where('symbol', '=', symbol)
    .where('interval', '=', interval)
    .orderBy('ts');

  if (start) {
    query = query.where('ts', '>=', start);
  }
  if (end) {
    query = query.where('ts', '<=', end);
  }
  const resp = await query.execute();
  yield* resp;
}