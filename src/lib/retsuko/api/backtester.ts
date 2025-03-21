'use server';

import { BacktestGroup, BacktestReport, BacktestRun } from '../interfaces/Backtest';
import { BacktestConfig, BulkBacktestConfig } from '../interfaces/BacktestConfig';
import { Trade } from '../interfaces/Trade';

const BACKEND_URL = process.env.BACKEND_URL;

export interface RunBacktestSingleRequest {
  config: BacktestConfig;
  hideTrades: boolean;
}

export async function runBacktestSingle(req: RunBacktestSingleRequest): Promise<BacktestReport> {
  const resp = await fetch(`${BACKEND_URL}/backtest/single/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  return await resp.json();
}

export async function getBacktestBulkRuns(): Promise<BacktestRun[]> {
  const resp = await fetch(`${BACKEND_URL}/backtest/bulk/run`);
  return await resp.json();
}

export async function getBacktestBulkRun(id: string): Promise<BacktestGroup> {
  const resp = await fetch(`${BACKEND_URL}/backtest/bulk/run/${id}`);
  return await resp.json();
}

export async function getBacktestSingleTrades(id: string, singleId: string): Promise<Trade[]> {
  const resp = await fetch(`${BACKEND_URL}/backtest/bulk/run/${id}/${singleId}/trades`);
  return await resp.json();
}

export async function runBacktestBulk(req: BulkBacktestConfig): Promise<BacktestRun> {
  const resp = await fetch(`${BACKEND_URL}/backtest/bulk/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  return await resp.json();
}
