import { Candle } from '../tables';
import { Portfolio } from './Portfolio';
import { Trade } from './Trade';
import { Trader } from './trader';

export interface PaperTraderOptions {
  initialBalance: number;
  fee: number;
  enableMargin: boolean;
  marginTradeAllWhenDirectionChanged: boolean;
  validTradeOnly: boolean;
}

export class PaperTrader implements Trader {
  $portfolio: Portfolio;
  $direction: 'long' | 'short' = 'short';
  $position: number = 0;

  constructor(
    private config: PaperTraderOptions,
  ) {
    this.$portfolio = {
      asset: 0,
      currency: config.initialBalance,
      totalBalance: config.initialBalance,
    };
  }

  public async handleAdvice(candle: Candle, direction: 'long' | 'short'): Promise<Trade | null> {
    if (direction === 'long') {
      if (!this.config.enableMargin && this.config.validTradeOnly && this.$direction === 'long') {
        return null;
      }

      if (this.config.enableMargin) {
        if (this.config.validTradeOnly) {
          if (this.$position >= 1) {
            return null;
          } else {
            this.$position = 1;
            this.buyMargin(-this.$portfolio.asset * candle.close + this.$portfolio.currency, candle.close);
          }
        }
        else if (
          this.config.marginTradeAllWhenDirectionChanged
          && this.$direction === 'short'
          && this.$portfolio.asset < 0
        ) {
          this.buyMargin(this.$portfolio.currency, candle.close);
        } else {
          this.buyMargin(this.config.initialBalance, candle.close);
        }
      } else {
        const amount = this.extractFee(this.$portfolio.currency / candle.close);
        this.$portfolio.asset += amount;
        this.$portfolio.currency = 0;
        this.$portfolio.totalBalance = this.$portfolio.asset * candle.close;
      }
      this.$direction = 'long';

    } else {
      if (!this.config.enableMargin && this.config.validTradeOnly && this.$direction === 'short') {
        return null;
      }

      if (this.config.enableMargin) {
        if (this.config.validTradeOnly) {
          if (this.$position <= -1) {
            return null;
          } else {
            this.$position = -1;
            this.sellMargin(this.$portfolio.asset, candle.close);
            this.sellMargin(this.$portfolio.currency / candle.close, candle.close);
          }
        }
        else if (
          this.config.marginTradeAllWhenDirectionChanged
          && this.$direction === 'long'
          && this.$portfolio.currency < 0
        ) {
          this.sellMargin(this.$portfolio.asset, candle.close);
        } else {
          this.sellMargin(this.config.initialBalance / candle.close, candle.close);
        }
      } else {
        const amount = this.extractFee(this.$portfolio.asset * candle.close);
        this.$portfolio.currency += amount;
        this.$portfolio.asset = 0;
        this.$portfolio.totalBalance = this.$portfolio.currency;
      }
      this.$direction = 'short';
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
    return Math.floor(amount * 1e8 * (1 - this.config.fee)) / 1e8;
  }

  buyMargin(price: number, close: number) {
    const amount = this.extractFee(price / close);
    this.$portfolio.asset += amount;
    this.$portfolio.currency -= price;
    this.$portfolio.totalBalance = this.$portfolio.currency + this.$portfolio.asset * close;
  }

  sellMargin(price: number, close: number) {
    const amount = this.extractFee(price * close);
    this.$portfolio.asset -= price;
    this.$portfolio.currency += amount;
    this.$portfolio.totalBalance = this.$portfolio.currency + this.$portfolio.asset * close;
  }

  serialize(): string {
    return JSON.stringify({
      inititalBalance: this.config.initialBalance ?? 1000,
      fee: this.config.fee,
      enableMargin: this.config.enableMargin,
      validTradeOnly: this.config.validTradeOnly,
      marginTradeAllWhenDirectionChanged: this.config.marginTradeAllWhenDirectionChanged,
      direction: this.$direction,
      portfolio: this.$portfolio,
    });
  }

  deserialize(data: string): void {
    const obj = JSON.parse(data);

    this.config = {
      initialBalance: obj.initialBalance,
      fee: obj.fee,
      enableMargin: obj.enableMargin ?? false,
      validTradeOnly: obj.validTradeOnly ?? false,
      marginTradeAllWhenDirectionChanged: obj.marginTradeAllWhenDirectionChanged ?? false,
    };
    this.$direction = obj.direction;
    this.$portfolio = obj.portfolio;
  }
}