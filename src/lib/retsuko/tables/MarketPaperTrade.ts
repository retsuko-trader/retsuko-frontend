import { type BinanceInterval } from '../binance';

export interface MarketPaperTraderState {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date | null;

  symbol: string;
  interval: BinanceInterval;

  strategyName: string;
  strategyConfigRaw: string;
  strategySerialized: string;

  traderSerialized: string;
}

export interface MarketPaperTraderModel {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date | null;

  symbol: string;
  interval: BinanceInterval;

  strategyName: string;
  strategyConfig: Record<string, number>;
  strategySerialized: string;

  trader: {
    inititalBalance: number;
    fee: number;
    portfolio: {
      asset: number;
      currency: number;
      totalBalance: number;
    };
  };
}

export interface MarketPaperTrade {
  id: string;
  traderId: string;

  ts: Date;
  action: 'buy' | 'sell';
  asset: number;
  currency: number;
  price: number;
  profit: number | null;
}