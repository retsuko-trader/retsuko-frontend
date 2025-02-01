import { Kline, KlineInterval, MainClient, USDMClient } from 'binance';
import { Candle, Market } from './tables';

export type BinanceInterval = KlineInterval;

function klineConverter(interval: BinanceInterval, market: Market, symbol: string) {
  return (kline: Kline): Candle => {
    return {
      market,
      symbol,
      interval,
      ts: new Date(kline[0]),
      open: parseFloat(kline[1].toString()),
      high: parseFloat(kline[2].toString()),
      low: parseFloat(kline[3].toString()),
      close: parseFloat(kline[4].toString()),
      volume: parseFloat(kline[5].toString()),
    };
  };
}

export async function* loadCandles(client: MainClient | USDMClient, options: {
  market: Market,
  symbol: string,
  interval: BinanceInterval,
  startTime?: number,
}): AsyncGenerator<Candle[]> {
  const { market, symbol, interval, startTime } = options;

  const convertFn = klineConverter(interval, market, symbol);

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

export async function getLatestCandles(client: MainClient | USDMClient, options: {
  market: Market,
  symbol: string,
  interval: BinanceInterval,
  limit: number,
}): Promise<Candle[]> {
  const { market, symbol, interval, limit } = options;

  const convertFn = klineConverter(interval, market, symbol);

  const rows = await client.getKlines({
    symbol,
    interval,
    endTime: Date.now(),
    limit,
  });

  return rows.map(convertFn);
}