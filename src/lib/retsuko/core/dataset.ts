export function getDatasetAlias(candleLike: {
  market: string;
  interval: string;
  symbol: string;
}): string {
  return `${candleLike.market}_${candleLike.symbol}_${candleLike.interval}`;
}

export function getDatasetCandidate(alias: string): {
  market: string;
  symbol: string;
  interval: string;
} {
  const [market, symbol, interval] = alias.split('_');
  return { market, symbol, interval };
}