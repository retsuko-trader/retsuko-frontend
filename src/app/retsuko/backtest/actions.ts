'use server';

import { BacktestConfig, Backtester } from '@/lib/retsuko/core/backtester';

export async function runBacktest(config: BacktestConfig) {
  const backTester = new Backtester(config);
  if (!await backTester.init()) {
    return null;
  }

  if (!await backTester.run()) {
    return null;
  }

  return backTester.report();
}