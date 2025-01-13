export function getDatasetAlias(candleLike: {
  source: string;
  interval: string;
  symbol: string;
}): string {
  return `${candleLike.source}_${candleLike.symbol}_${candleLike.interval}`;
}

export function getDatasetCandidate(alias: string): {
  source: string;
  symbol: string;
  interval: string;
} {
  const [source, symbol, interval] = alias.split('_');
  return { source, symbol, interval };
}