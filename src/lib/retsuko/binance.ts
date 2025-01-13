import { Kline, MainClient } from 'binance';
import { Candle } from './tables/candle';

const SOURCE = 'binance';

export type BinanceInterval = (
  | '1s'
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '6h'
  | '8h'
  | '12h'
  | '1d'
  | '3d'
  | '1w'
  | '1M'
)

function klineConverter(interval: BinanceInterval, symbol: string) {
  return (kline: Kline): Candle => {
    return {
      source: SOURCE,
      interval,
      symbol,
      ts: new Date(kline[0]),
      open: parseFloat(kline[1].toString()),
      high: parseFloat(kline[2].toString()),
      low: parseFloat(kline[3].toString()),
      close: parseFloat(kline[4].toString()),
      volume: parseFloat(kline[5].toString()),
    };
  };
}

export async function* loadCandles(client: MainClient, options: {
  symbol: string,
  interval: BinanceInterval,
  startTime?: number,
}): AsyncGenerator<Candle[]> {
  const { symbol, interval, startTime } = options;

  const convertFn = klineConverter(interval, symbol);

  let rows = await client.getKlines({
    symbol,
    interval,
    limit: 1000,
    startTime,
  });
  yield rows.map(convertFn);

  while (rows.length >= 1000) {
    rows = await client.getKlines({
      symbol,
      interval,
      limit: 1000,
      endTime: rows[0][0],
    });
    yield rows.map(convertFn);

    // await setTimeout(100);
  }
}