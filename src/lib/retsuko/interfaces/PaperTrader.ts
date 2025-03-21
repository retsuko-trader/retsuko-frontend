import { TraderMetrics } from './Backtest';
import { PapertraderConfig } from './PapertraderConfig';

export interface PaperTrader {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
  config: PapertraderConfig;
  metrics: TraderMetrics;
}
