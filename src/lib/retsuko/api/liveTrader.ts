import { LiveTraderOrder, LiveTraderState, LiveTraderTrade } from '../interfaces/LiveTrader';

const BACKEND_URL = process.env.BACKEND_URL;

export async function getLiveTraders(): Promise<LiveTraderState[]> {
  const response = await fetch(`${BACKEND_URL}/livetrader`);
  const data = await response.json();

  return data;
}

export async function getLiveTrader(id: string): Promise<LiveTraderState | null> {
  const response = await fetch(`${BACKEND_URL}/livetrader/${id}`);
  const data = await response.json();

  if (response.status !== 200) {
    return null;
  }

  return data;
}

export async function getLiveTraderTrades(id: string): Promise<{ trades: LiveTraderTrade[]; orders: LiveTraderOrder[] }> {
  const response = await fetch(`${BACKEND_URL}/livetrader/${id}/trade`);
  const data = await response.json();

  return data;
}
