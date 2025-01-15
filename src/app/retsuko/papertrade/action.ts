'use server';

import { BinanceInterval } from '@/lib/retsuko/binance';
import { createLiveMarket } from '@/lib/retsuko/core/liveMarket';
import { PaperTrader } from '@/lib/retsuko/core/paperTrader';
import { StrategyEntries } from '@/lib/retsuko/core/strategies';

export async function startPapertrade(
  symbol: string,
  interval: BinanceInterval,
  strategyName: string,
) {
  const strategyEntry = StrategyEntries.find(x => x.name === strategyName);
  if (!strategyEntry) {
    return false;
  }

  const config = strategyEntry.config;
  if (strategyName === 'StochRSI') {
    config.weight = 1;
    config.low = 1;
    config.high = 99;
    config.persistence = 2;
  }

  await createLiveMarket(
    { market: 'futures', symbol, interval },
    new strategyEntry.entry('test', config),
    new PaperTrader(1000, 0.001),
  );

  return true;
}