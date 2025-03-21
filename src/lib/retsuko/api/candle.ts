import { Dataset } from '../interfaces/Dataset';
import { Symbol } from '../interfaces/Symbol';

const BACKEND_URL = process.env.BACKEND_URL;

export async function getDataset(): Promise<Dataset[]> {
  const response = await fetch(`${BACKEND_URL}/candle`);
  const data = await response.json();

  return data;
}

export async function getSymbols(): Promise<Symbol[]> {
  const response = await fetch(`${BACKEND_URL}/candle/symbol`);
  const data = await response.json();

  return data;
}
