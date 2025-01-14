'use server';

import { SingleBacktestConfig, SingleBacktester } from '@/lib/retsuko/core/singleBacktester';

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
