'use server';

import { Candle } from '../interfaces/Candle';
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

export async function getCandles(symbolId: number, interval: number, start?: Date, end?: Date, sampleRate?: number): Promise<Candle[]> {
  var params = new URLSearchParams();
  if (start) {
    params.append('start', start.toISOString());
  }
  if (end) {
    params.append('end', end.toISOString());
  }
  if (sampleRate) {
    params.append('sampleRate', sampleRate.toString());
  }

  console.log(`${BACKEND_URL}/candle/candle/0/${symbolId}/${interval}?${params.toString()}`);
  const response = await fetch(`${BACKEND_URL}/candle/candle/0/${symbolId}/${interval}?${params.toString()}`);
  const data = await response.json();

  return data;
}
