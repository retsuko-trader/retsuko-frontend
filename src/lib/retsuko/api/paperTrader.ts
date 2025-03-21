import { PaperTrader, PaperTraderTrade } from '../interfaces/PaperTrader';
import { PapertraderConfig } from '../interfaces/PapertraderConfig';

const BACKEND_URL = process.env.BACKEND_URL;

export async function getPaperTraders(): Promise<PaperTrader[]> {
  const response = await fetch(`${BACKEND_URL}/papertrader`);
  const data = await response.json();

  return data;
}

export async function getPaperTrader(id: string): Promise<PaperTrader> {
  const response = await fetch(`${BACKEND_URL}/papertrader/${id}`);
  return await response.json();
}

export async function getPaperTraderTrades(id: string): Promise<PaperTraderTrade[]> {
  const response = await fetch(`${BACKEND_URL}/papertrader/${id}/trade`);
  return await response.json();
}

export async function createPaperTrader(req: { config: PapertraderConfig }): Promise<PaperTrader> {
  const response = await fetch(`${BACKEND_URL}/papertrader/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  return await response.json();
}
