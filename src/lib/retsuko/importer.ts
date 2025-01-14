import { CompiledQuery } from 'kysely';
import { createKysely, db } from '../db/duckdb';
import { Candle, Market } from './tables';
import { searchDatasets } from './dataset';
import { BinanceInterval, loadCandles } from './binance';
import { MainClient, USDMClient } from 'binance';

const DB_CANDLE_URL = process.env.DB_CANDLE_URL || 'candles.db';
const candleDb = createKysely<{ candle: Candle }>(DB_CANDLE_URL);

const usdmClient = new USDMClient();
const mainClient = new MainClient();

export async function getSymbols() {
  const client = usdmClient;
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
    database: candleDb,
  });

  const client = market === 'futures' ? usdmClient : mainClient;
  const candles = existsDatasets.length === 0
    ? loadCandles(client, { market, symbol, interval })
    : loadCandles(client, { market, symbol, interval, startTime: existsDatasets[0].end.getTime() });

  for await (const chunk of candles) {
    if (chunk.length === 0) {
      break;
    }

    await candleDb.insertInto('candle')
      .values(chunk)
      .onConflict(ctx => ctx.doNothing())
      .execute();
  }

  const resp = await searchDatasets({
    market,
    symbol,
    interval,
    database: candleDb,
  });

  return resp[0];
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