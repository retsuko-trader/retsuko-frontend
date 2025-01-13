import { CompiledQuery } from 'kysely';
import { db } from '../db/duckdb';

export type Dataset = {
  symbol: string;
  source: string;
  interval: string;
  start: Date;
  end: Date;
  count: number;
};

export async function getDatasetList(): Promise<Dataset[]> {
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
    .$castTo<Dataset>()
    .execute();

  return resp;
}

export async function* getCandles(options: {
  source: string;
  symbol: string;
  interval: string;
  start?: Date;
  end?: Date;
}) {
  const { source, symbol, interval, start, end } = options;

  // TODO: chunk optimize
  const query = db.selectFrom('candle')
    .selectAll()
    .where('source', '=', source)
    .where('symbol', '=', symbol)
    .where('interval', '=', interval)
    .orderBy('ts');

  if (start) {
    query.where('ts', '>=', start);
  }
  if (end) {
    query.where('ts', '<=', end);
  }
  const resp = await query.execute();
  yield* resp;
}

export async function importFromCandleDb() {
  // TODO: optimize
  await db.executeQuery(CompiledQuery.raw(`ATTACH 'db/candles.duckdb' AS candles_db (READ_ONLY)`));
  await db.executeQuery(CompiledQuery.raw(`INSERT INTO candle SELECT * FROM candles_db.candle`))
  await db.executeQuery(CompiledQuery.raw(`DETACH candles_db`));
}