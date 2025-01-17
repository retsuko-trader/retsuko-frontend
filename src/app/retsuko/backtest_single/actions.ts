'use server';

import { getDatasetCandidate } from '@/lib/retsuko/core/dataset';
import { SingleBacktestConfig, SingleBacktester } from '@/lib/retsuko/core/singleBacktester';
import { getCandles } from '@/lib/retsuko/repository';

export async function loadCandles(config: SingleBacktestConfig) {
  const candidate = getDatasetCandidate(config.dataset.alias);
  const candles = getCandles({
    ...candidate,
    start: config.dataset.start,
    end: config.dataset.end,
  });

  // not supported in nodejs 20?
  // return await Array.fromAsync(candles);

  const result = [];
  for await (const candle of candles) {
    result.push(candle);
  }

  return result;
}

export async function runBacktest(config: SingleBacktestConfig) {
  const backTester = new SingleBacktester(config);
  if (!await backTester.init()) {
    return null;
  }

  if (!await backTester.run()) {
    return null;
  }

  return backTester.report();
}
