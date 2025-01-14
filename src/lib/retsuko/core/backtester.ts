import { getCandles } from '../dataset';
import { Candle } from '../tables';
import { getDatasetCandidate } from './dataset';
import { PaperTrader } from './paperTrader';
import { StrategyEntries } from './strategies';
import { Strategy } from './strategy';
import { Trade } from './Trade';

export interface BacktestConfig {
  dataset: {
    alias: string;
    start?: Date;
    end?: Date;
  };
  strategy: {
    name: string;
    config: Record<string, number>;
  };
  trader: {
    balance: number;
    fee: number;
  };
}

export interface BacktestReport {
  config: BacktestConfig;
  startBalance: number;
  endBalance: number;
  profit: number;
  trades: Trade[];
}

export class Backtester {
  constructor(
    private readonly config: BacktestConfig,
  ) { }

  $candles: AsyncGenerator<Candle> | null = null;
  $strategy: Strategy<Record<string, number>> | null = null;
  $trader: PaperTrader | null = null;

  $trades: Trade[] = [];

  $lastCandle: Candle | null = null;

  public async init() {
    const { market, symbol, interval } = getDatasetCandidate(this.config.dataset.alias);

    this.$candles = getCandles({
      market,
      symbol,
      interval,
      start: this.config.dataset.start,
      end: this.config.dataset.end,
    });

    const strategyEntry = StrategyEntries.find(x => x.name === this.config.strategy.name);
    if (!strategyEntry) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.$strategy = new strategyEntry.entry(this.config.strategy.name, this.config.strategy.config as any);

    this.$trader = new PaperTrader(this.config.trader.balance, this.config.trader.fee);

    return true;
  }

  public async run() {
    if (!this.$candles || !this.$strategy || !this.$trader) {
      return false;
    }

    for await (const candle of this.$candles) {

      const direction = await this.$strategy.update(candle);
      if (direction) {
        const trade = await this.$trader.handleAdvice(candle, direction);

        if (this.$trades.length > 0) {
          const lastTrade = this.$trades[this.$trades.length - 1];
          const profit = lastTrade.action === 'buy'
            ? (candle.close - lastTrade.price) / lastTrade.price
            : (lastTrade.price - candle.close) / candle.close;

          lastTrade.profit = profit;
          this.$trades[this.$trades.length - 1] = lastTrade;
        }

        if (trade) {
          this.$trades.push(trade);
        }
      }

      this.$lastCandle = candle;
    }

    return true;
  }

  public report(): BacktestReport | null {
    if (!this.$trader || !this.$lastCandle) {
      return null;
    }

    const portfolio = this.$trader.$portfolio;

    const startBalance = this.config.trader.balance;
    const endBalance = portfolio.currency + portfolio.asset * this.$lastCandle.close;

    const profit = (endBalance - startBalance) / startBalance;

    return {
      config: this.config,
      startBalance,
      endBalance,
      profit,
      trades: this.$trades,
    };
  }
}