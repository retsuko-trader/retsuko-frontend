import { CompiledQuery } from 'kysely';
import { db } from '../db/duckdb';

export async function GetDatasetList() {
  const resp = await db.selectFrom('candle')
    .select(({ fn }) => [
      'source',
      'interval',
      'symbol',
      fn.min('ts').as('start'),
      fn.max('ts').as('end'),
      fn.count('ts').as('count'),
    ])
    .groupBy(['source', 'interval', 'symbol'])
    .orderBy(['source', 'symbol', 'interval'])
    .execute();

  return resp;
}

export async function importFromCandleDb() {
  // TODO: optimize
  await db.executeQuery(CompiledQuery.raw(`ATTACH 'db/candles.duckdb' AS candles_db (READ_ONLY)`));
  await db.executeQuery(CompiledQuery.raw(`INSERT INTO candle SELECT * FROM candles_db.candle`))
  await db.executeQuery(CompiledQuery.raw(`DETACH candles_db`));
}