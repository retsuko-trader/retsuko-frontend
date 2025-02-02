import { USDMClient } from 'binance';
import { Trader } from './trader';
import { Candle } from '../tables';
import { Trade } from './Trade';

export interface LiveTraderOptions {
  testnet: boolean;
}

export class LiveTrader implements Trader {
  $client = new USDMClient();

  constructor(
    private readonly config: LiveTraderOptions,
  ) {
    if (config.testnet) {
      this.$client = new USDMClient({
        useTestnet: true,
        api_key: process.env.BINANCE_TESTNET_API_KEY,
        api_secret: process.env.BINANCE_TESTNET_API_SECRET,
      });
    }
  }

  public async handleAdvice(candle: Candle, direction: 'long' | 'short'): Promise<Trade | null> {
    this.$client.submitNewOrder({
      symbol: 'BTCUSDT',
      side: direction === 'long' ? 'BUY' : 'SELL',
      type: 'LIMIT',
      quantity: 0.001,
      price: candle.close,
    })
  }

  public async getPortfolio(): Promise<void> {
    // TODO
  }

  public serialize(): string {
    // TODO
    return '';
  }

  public deserialize(data: string): void {
    // TODO
  }
}