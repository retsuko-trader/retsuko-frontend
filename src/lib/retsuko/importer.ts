import { CompiledQuery } from 'kysely';
import { createKysely, db } from '../db/duckdb';
import { Candle, Market } from './tables/candle';
import { searchDatasets } from './dataset';
import { BinanceInterval, loadCandles } from './binance';
import { MainClient, USDMClient } from 'binance';

const DB_CANDLE_URL = process.env.DB_CANDLE_URL || 'candles.db';

export async function getSymbols() {
  const client = new USDMClient();
  const symbols = await client.getExchangeInfo();
  return symbols.symbols.map((s) => s.symbol);
}

export async function downloadDatasetToCandleDb(options: {
  market: Market;
  symbol: string;
  interval: BinanceInterval;
}) {
  const { market, symbol, interval } = options;

  const existsDatasets = await searchDatasets({
    market,
    symbol,
    interval,
  });

  const candleDb = createKysely<{ candle: Candle }>(DB_CANDLE_URL);
  const client = market === 'futures' ? new USDMClient() : new MainClient();
  const candles = existsDatasets.length === 0
    ? loadCandles(client, { market, symbol, interval })
    : loadCandles(client, { market, symbol, interval, startTime: existsDatasets[0].end.getTime() });

  for await (const chunk of candles) {
    await candleDb.insertInto('candle')
      .values(chunk)
      .onConflict(ctx => ctx.doNothing())
      .execute();
  }

  const resp = await candleDb
    .selectFrom('candle')
    .select(({ fn }) => [
      fn.min('ts').as('start'),
      fn.max('ts').as('end'),
      fn.count('ts').as('count'),
    ])
    .where('market', '=', market)
    .where('symbol', '=', symbol)
    .where('interval', '=', interval)
    .$castTo<{ start: Date, end: Date, count: number }>()
    .executeTakeFirst();

  await candleDb.destroy();
  return resp;
}

export async function downloadDatasets(options: Array<{
  market: Market;
  symbol: string;
  interval: BinanceInterval;
}>) {
  for (const option of options) {
    await downloadDatasetToCandleDb(option);
  }
}

export async function importFromCandleDb() {
  // TODO: optimize
  await db.executeQuery(CompiledQuery.raw(`ATTACH '${DB_CANDLE_URL}' AS candles_db (READ_ONLY)`));
  await db.executeQuery(CompiledQuery.raw(`INSERT INTO candle SELECT * FROM candles_db.candle`))
  await db.executeQuery(CompiledQuery.raw(`DETACH candles_db`));
}