'use server';

import { CreateMarketPaperTraderConfig, createMarketPaperTrader } from '@/lib/retsuko/core/marketPaperTrader';

export async function createTrader(config: CreateMarketPaperTraderConfig) {
  return await createMarketPaperTrader(config);
}