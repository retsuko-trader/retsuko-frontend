import { BacktestConfig, BulkBacktestConfig } from './BacktestConfig';
import { Trade } from './Trade';

export interface TraderMetrics {
  startBalance: number;
  endBalance: number;
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

export interface BacktestReport {
  config: BacktestConfig;
  trades: Trade[];
  metrics: TraderMetrics;
}

export interface BacktestSingle {
  id: string;
  run_id: string;
  dataset_start: string;
  dataset_end: string;
  config: BacktestConfig;
  metrics: TraderMetrics;
}

export interface BacktestRun {
  id: string;
  name: string;
  description: string;
  created_at: string;
  ended_at: string | null;
  config: BulkBacktestConfig;
}
