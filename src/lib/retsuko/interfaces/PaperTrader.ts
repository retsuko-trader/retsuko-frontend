import { TraderMetrics } from './Backtest';
import { PapertraderConfig } from './PapertraderConfig';
import { SignalKind } from './Trade';

export interface PaperTrader {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
  config: PapertraderConfig;
  metrics: TraderMetrics;
  dump: string;
}

export interface PaperTraderTrade {
  id: string;
  traderId: string;
  ts: string;
  signal: SignalKind;
  confidence: number;
  asset: number;
  currency: number;
  price: number;
  profit: number;
}
