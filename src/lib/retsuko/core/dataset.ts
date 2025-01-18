import type { BinanceInterval } from '../binance';
import type { Market } from '../tables';

export interface CandleLike {
  market: Market;
  symbol: string;
  interval: BinanceInterval;
}

export function getDatasetAlias(candleLike: CandleLike): string {
  return `${candleLike.market}_${candleLike.symbol}_${candleLike.interval}`;
}

export function getDatasetCandidate(alias: string): CandleLike {
  const [market, symbol, interval] = alias.split('_');
  return { market, symbol, interval } as CandleLike;
}
