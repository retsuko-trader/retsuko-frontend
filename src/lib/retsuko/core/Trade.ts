import type { SignalKind } from './Signal';

export interface Trade {
  ts: Date;
  action: SignalKind;
  confidence: number;
  asset: number;
  currency: number;
  price: number;

  profit: number;
}