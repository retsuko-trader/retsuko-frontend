import { Candle } from '../tables';
import { Portfolio } from './Portfolio';
import { Signal } from './Signal';
import { Trade } from './Trade';
import { Trader } from './trader';

export interface PaperTraderOptions {
  initialBalance: number;
  fee: number;
  enableMargin: boolean;
  validTradeOnly: boolean;
}

interface Position {
  ts: number;
  kind: 'long' | 'short';
  confidence: number;
}

export class PaperTrader implements Trader {
  $portfolio: Portfolio;
  $position: Position | null;

  constructor(
    private config: PaperTraderOptions,
  ) {
    this.$portfolio = {
      asset: 0,
      currency: config.initialBalance,
      totalBalance: config.initialBalance,
    };
    this.$position = null;
  }

  public async handleAdvice(candle: Candle, signalRaw: Signal): Promise<Trade | null> {
    const signal = Signal.format(signalRaw);
    const { action, confidence } = signal;

    let handled = false;
    if (action === 'long') {
      handled = this.handleLong(candle, confidence);
    } else if (action === 'short') {
      handled = this.handleShort(candle, confidence);
    } else if (action === 'closeLong') {
      if (this.$position?.kind === 'long') {
        this.sell(candle.close, { assetDesired: 0 });
        this.$position = null;
        handled = true;
      }
    } else if (action === 'closeShort') {
      if (this.$position?.kind === 'short') {
        this.buy(candle.close, { assetDesired: 0 });
        this.$position = null;
        handled = true;
      }
    } else if (action === 'close') {
      if (this.$position?.kind === 'long') {
        this.sell(candle.close, { assetDesired: 0 });
        this.$position = null;
        handled = true;
      } else if (this.$position?.kind === 'short') {
        this.buy(candle.close, { currencyDesired: 0 });
        this.$position = null;
        handled = true;
      }
    }

    this.$portfolio.totalBalance = this.totalBalance(candle.close);
    if (!handled) {
      return null;
    }

    return {
      ts: candle.ts,
      action: signal.action,
      confidence: signal.confidence,
      asset: this.$portfolio.asset,
      currency: this.$portfolio.currency,
      price: candle.close,
      profit: 0,
    };
  }

  handleLong(candle: Candle, confidence: number) {
    const prevConfidence = this.$position?.confidence ?? 0;
    if (this.$position?.kind === 'long' && prevConfidence >= confidence) {
      if (this.config.validTradeOnly) {
        return false;
      }

      this.$portfolio.totalBalance = this.totalBalance(candle.close);
      return true;
    }

    this.buy(candle.close, { currencyDesired: this.$portfolio.totalBalance * (1 - confidence) });
    this.$position = {
      ts: candle.ts.getTime(),
      kind: 'long',
      confidence,
    }
    return true;
  }

  handleShort(candle: Candle, confidence: number) {
    const prevConfidence = this.$position?.confidence ?? 0;
    if (this.$position?.kind === 'short' && prevConfidence >= confidence) {
      if (this.config.validTradeOnly) {
        return false;
      }

      return true;
    }

    if (this.config.enableMargin) {
      const minAsset = -this.totalBalance(candle.close) / candle.close;
      const assetDesired = minAsset * confidence;

      this.sell(candle.close, { assetDesired });
    } else {
      if (this.$portfolio.asset <= 0) {
        return false;
      }

      this.sell(candle.close, { assetDesired: 0 });
    }

    this.$position = {
      ts: candle.ts.getTime(),
      kind: 'short',
      confidence,
    }
    return true;
  }

  public async getPortfolio(): Promise<Portfolio> {
    return this.$portfolio;
  }

  extractFee(amount: number) {
    return Math.floor(amount * 1e8 * (1 - this.config.fee)) / 1e8;
  }

  addFee(amount: number) {
    return Math.floor(amount * 1e8 / (1 - this.config.fee)) / 1e8;
  }

  totalBalance(close: number) {
    return this.$portfolio.currency + this.$portfolio.asset * close;
  }

  buy(close: number, ...options: Array<{
    asset?: number;
    assetBeforeFee?: number;
    assetDesired?: number;
    currency?: number;
    currencyDesired?: number;
  }>) {
    if (options.length === 0) {
      return;
    }

    let totalAmount = 0;
    let totalPrice = 0;

    for (const option of options) {
      let amount = 0;
      let price = 0;

      if (option.asset !== undefined) {
        amount += option.asset;
        price += this.addFee(option.asset * close);
      }
      if (option.assetBeforeFee !== undefined) {
        const asset = this.extractFee(option.assetBeforeFee);
        amount += asset;
        price += asset * close;
      }
      if (option.currency !== undefined) {
        amount += this.extractFee(option.currency / close);
        price += option.currency;
      }

      if (option.assetDesired !== undefined) {
        amount = option.assetDesired - this.$portfolio.asset;
        price = this.addFee(amount * close);
      }
      if (option.currencyDesired !== undefined) {
        price = this.$portfolio.currency - option.currencyDesired;
        amount = this.extractFee(price / close);
      }

      totalAmount += amount;
      totalPrice += price;
    }

    this.$portfolio.asset += totalAmount;
    this.$portfolio.currency -= totalPrice;
    this.$portfolio.totalBalance = this.totalBalance(close);
  }

  sell(close: number, ...options: Array<{
    asset?: number;
    assetDesired?: number;
    currency?: number;
    currencyBeforeFee?: number;
    currencyDesired?: number;
  }>) {
    if (options.length === 0) {
      return;
    }

    let totalAmount = 0;
    let totalPrice = 0;

    for (const option of options) {
      let amount = 0;
      let price = 0;

      if (option.asset !== undefined) {
        amount += option.asset;
        price += this.extractFee(option.asset * close);
      }
      if (option.currency !== undefined) {
        amount += this.extractFee(option.currency / close);
        price += option.currency;
      }
      if (option.currencyBeforeFee !== undefined) {
        const asset = option.currencyBeforeFee / close;
        amount += asset;
        price += this.addFee(asset * close);
      }

      if (option.assetDesired !== undefined) {
        amount = this.$portfolio.asset - option.assetDesired;
        price = this.extractFee(amount * close);
      }
      if (option.currencyDesired !== undefined) {
        price = option.currencyDesired - this.$portfolio.currency;
        amount = this.addFee(price / close);
      }

      totalAmount += amount;
      totalPrice += price;
    }

    this.$portfolio.asset -= totalAmount;
    this.$portfolio.currency += totalPrice;
    this.$portfolio.totalBalance = this.totalBalance(close);
  }

  serialize(): string {
    return JSON.stringify({
      inititalBalance: this.config.initialBalance ?? 1000,
      fee: this.config.fee,
      enableMargin: this.config.enableMargin,
      validTradeOnly: this.config.validTradeOnly,
      portfolio: this.$portfolio,
      position: this.$position,
    });
  }

  deserialize(data: string): void {
    const obj = JSON.parse(data);

    this.config = {
      initialBalance: obj.initialBalance,
      fee: obj.fee,
      enableMargin: obj.enableMargin ?? false,
      validTradeOnly: obj.validTradeOnly ?? false,
    };
    this.$portfolio = obj.portfolio;
    this.$position = obj.position;
  }
}