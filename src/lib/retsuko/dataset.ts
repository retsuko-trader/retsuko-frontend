import { db } from '../db/duckdb';

export async function GetDatasetList() {
  const resp = await db.selectFrom('candle')
    .select(({ fn }) => [
      'source',
      'interval',
      'symbol',
      fn.min('ts').as('start'),
      fn.max('ts').as('end'),
    ])
    .groupBy(['source', 'interval', 'symbol'])
    .execute();

  return resp;
}