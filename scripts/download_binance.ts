process.env.DB_URL = './db/candles.duckdb';

import { MainClient } from 'binance';
import { db } from '../src/lib/db/duckdb';
import { loadCandles } from '../src/lib/retsuko/binance';

const client = new MainClient();

export async function download(symbol: string, interval: Parameters<typeof loadCandles>[1]['interval']) {
  const candles = loadCandles(client, {
    symbol,
    interval,
  });

  for await (const chunk of candles) {
    await db.insertInto('candle')
      .values(chunk)
      .onConflict(ctx => ctx.doNothing())
      .execute();
    console.log(`Inserted ${chunk.length} rows: ${chunk[0].ts.toISOString()} - ${chunk[chunk.length - 1].ts.toISOString()}`);
  }
}

async function main() {
  await db.schema
    .createTable('candle')
    .ifNotExists()
    .addColumn('source', 'varchar(32)')
    .addColumn('interval', 'varchar(16)')
    .addColumn('symbol', 'varchar(32)')
    .addColumn('ts', 'timestamp')
    .addColumn('open', 'float8')
    .addColumn('close', 'float8')
    .addColumn('high', 'float8')
    .addColumn('low', 'float8')
    .addColumn('volume', 'float8')
    .addPrimaryKeyConstraint('primary_key', ['source', 'interval', 'symbol', 'ts'])
    .execute();

  const symbols = [
    'BTCUSDT',
    'ETHUSDT',
    'XRPUSDT',
    'SOLUSDT',
    'DOGEUSDT',
  ];

  const intervals = ['5m', '30m', '1h', '12h'] as const;

  for (const symbol of symbols) {
    for (const interval of intervals) {
      await download(symbol, interval);
    }
  }

  await db.destroy();
}

main();