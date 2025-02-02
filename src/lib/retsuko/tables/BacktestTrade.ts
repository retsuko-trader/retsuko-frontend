import type { SignalKind } from '../core/Signal';

export interface BacktestTrade {
  backtestSingleId: string;
  ts: Date;
  action: SignalKind;
  confidence: number;
  asset: number;
  currency: number;
  price: number;

  profit: number;
}
