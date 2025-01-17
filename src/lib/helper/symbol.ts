export const sortedSymbols = [
  'BTCUSDT',
  'ETHUSDT',
  'BCHUSDT',
  'XRPUSDT',
  'EOSUSDT',
  'LTCUSDT',
  'TRXUSDT',
  'ETCUSDT',
  'LINKUSDT',
  'XLMUSDT',
  'ADAUSDT',
  'XMRUSDT',
  'DASHUSDT',
  'ZECUSDT',
  'XTZUSDT',
  'BNBUSDT',
  'ATOMUSDT',
  'ONTUSDT',
  'IOTAUSDT',
  'BATUSDT',
  'VETUSDT',
  'NEOUSDT',
  'QTUMUSDT',
  'IOSTUSDT',
  'THETAUSDT',
  'ALGOUSDT',
  'ZILUSDT',
  'KNCUSDT',
  'ZRXUSDT',
  'COMPUSDT',
];

export function sortSymbol(a: string, b: string): number {
  if (sortedSymbols.indexOf(a) === -1) {
    return 1;
  } else if (sortedSymbols.indexOf(b) === -1) {
    return -1;
  }

  return sortedSymbols.indexOf(a) - sortedSymbols.indexOf(b);
}
