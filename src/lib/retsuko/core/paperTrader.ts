import { Candle } from '../tables';
import { Portfolio } from './Portfolio';
import { Trade } from './Trade';
import { Trader } from './trader';

export class PaperTrader implements Trader {
  $portfolio: Portfolio;

  constructor(
    private readonly initialBalance: number,
    private readonly fee: number,
  ) {
    this.$portfolio = {
      asset: 0,
      currency: initialBalance,
      totalBalance: initialBalance,
    };
  }

  public async handleAdvice(candle: Candle, direction: 'long' | 'short'): Promise<Trade | null> {
    if (direction === 'long') {
      const amount = this.extractFee(this.$portfolio.currency / candle.close);
      this.$portfolio.asset += amount;
      this.$portfolio.currency = 0;
    } else {
      const amount = this.extractFee(this.$portfolio.asset * candle.close);
      this.$portfolio.currency += amount;
      this.$portfolio.asset = 0;
    }

    this.$portfolio.totalBalance = this.$portfolio.currency + this.$portfolio.asset * candle.close;

    return {
      ts: candle.ts,
      action: direction === 'long' ? 'buy' : 'sell',
      asset: this.$portfolio.asset,
      currency: this.$portfolio.currency,
      price: candle.close,
      profit: 0,
    };
  }

  public async getPortfolio(): Promise<Portfolio> {
    return this.$portfolio;
  }

  extractFee(amount: number) {
    return Math.floor(amount * 1e8 * (1 - this.fee)) / 1e8;
  }
}