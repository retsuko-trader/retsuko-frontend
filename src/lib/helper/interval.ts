import { BinanceInterval } from '../retsuko/binance';

export const sortedIntervals = [
  '1s',
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '1M',
] as const;

export function sortInterval(a: BinanceInterval, b: BinanceInterval): number {
  return sortedIntervals.indexOf(a) - sortedIntervals.indexOf(b);
}
