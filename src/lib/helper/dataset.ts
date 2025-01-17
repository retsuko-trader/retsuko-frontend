import { BinanceInterval } from '../retsuko/binance';
import { getDatasetCandidate } from '../retsuko/core/dataset';
import { sortInterval } from './interval';
import { sortSymbol } from './symbol';

type DatasetLike = {
  market: string;
  symbol: string;
  interval: BinanceInterval;
}

export const sortDataset = (a: DatasetLike, b: DatasetLike): number => {
  const market = a.market.localeCompare(b.market);
  if (market !== 0) {
    return market;
  }

  const symbol = sortSymbol(a.symbol, b.symbol);
  if (symbol !== 0) {
    return symbol;
  }

  return sortInterval(a.interval, b.interval);
}

export const sortDatasetAlias = (a: string, b: string): number => {
  return sortDataset(getDatasetCandidate(a), getDatasetCandidate(b));
}
