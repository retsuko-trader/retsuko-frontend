export enum SignalKind {
  long = 0,
  short = 1,
  closeLong = 2,
  closeShort = 3,
}

export interface Trade {
  ts: string;
  signal: SignalKind,
  confidence: number;
  asset: number;
  currency: number;
  price: number;
  profit: number;
}
