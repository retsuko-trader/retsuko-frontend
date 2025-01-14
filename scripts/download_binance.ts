process.env.DB_URL = './db/db.duckdb';
process.env.DB_CANDLE_URL = './db/candles.duckdb';
process.env.DB_ACCESS_MODE = 'READ_ONLY';

import { createKysely } from '../src/lib/db/duckdb';
import { Candle } from '../src/lib/retsuko/tables/candle';
import { up } from '../src/migrations/1735797084288_CreateCandle';
import { downloadDatasetToCandleDb, getSymbols } from '../src/lib/retsuko/importer';

async function main() {
  // const candleDb = createKysely<{ candle: Candle }>(process.env.DB_CANDLE_URL!);
  // await up(candleDb);
  // await candleDb.destroy();

  const symbols = (await getSymbols()).splice(0, 10);

  console.log(`Downloading datasets for ${symbols.length} symbols...`);

  const markets = ['futures', 'spot'] as const;
  const intervals = ['5m', '30m', '1h', '2h', '4h', '8h', '12h', '1d'] as const;

  for (const market of markets) {
    for (const symbol of symbols) {
      for (const interval of intervals) {
        const resp = await downloadDatasetToCandleDb({
          market,
          symbol,
          interval,
        });

        console.log(`Downloaded ${market}_${symbol}_${interval}: ${resp?.count} candles, ${resp?.start.toISOString()} - ${resp?.end.toISOString()}`);
      }
    }
  }
}

main();