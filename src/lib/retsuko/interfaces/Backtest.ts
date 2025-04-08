import { BacktestConfig, BulkBacktestConfig } from './BacktestConfig';
import { Trade } from './Trade';

export interface TraderMetrics {
  startBalance: number;
  endBalance: number;
  asset: number;
  currency: number;
  totalBalance: number;
  totalTrades: number;
  avgTrades: number;
  totalProfit: number;
  cagr: number;
  sortino: number;
  sharpe: number;
  calmar: number;
  minBalance: number;
  minBalanceTs: string;
  maxBalance: number;
  maxBalanceTs: string;
  drawdown: number;
  drawdownHigh: number;
  drawdownLow: number;
  drawdownStartTs: string;
  drawdownEndTs: string;
  marketChange: number;
}

export interface DebugIndicatorEntry {
  ts: number;
  value: number;
}

export interface DebugIndicator {
  name: string;
  index: number;
  values: DebugIndicatorEntry[];
}

export interface BacktestReport {
  config: BacktestConfig;
  trades: Trade[];
  metrics: TraderMetrics;
  debugIndicators: DebugIndicator[];
}

export interface BacktestSingle {
  id: string;
  run_id: string;
  dataset_start: string;
  dataset_end: string;
  config: BacktestConfig;
  metrics: TraderMetrics;
  trades: Trade[];
}

export interface BacktestRun {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  endedAt: string | null;
  config: BulkBacktestConfig;
}

export interface BacktestGroup {
  run: BacktestRun;
  singles: BacktestSingle[];
}
