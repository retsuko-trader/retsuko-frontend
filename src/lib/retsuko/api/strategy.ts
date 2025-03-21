import { StrategyEntry } from '../interfaces/Strategy';

const BACKEND_URL = process.env.BACKEND_URL;

export async function getStrategies(): Promise<StrategyEntry[]> {
  const response = await fetch(`${BACKEND_URL}/strategy`);
  const data = await response.json();

  return data;
}
