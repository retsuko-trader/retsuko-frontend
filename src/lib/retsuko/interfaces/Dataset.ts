export enum Market {
  futures = 0,
  spot = 1,
}

export interface Dataset {
  market: Market;
  symbolId: number;
  interval: number;
  start: string;
  end: string;
  count: number;
}
