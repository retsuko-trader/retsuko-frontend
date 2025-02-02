import { getCandles } from '../repository';
import { Candle, DatasetConfig } from '../tables';
import { getDatasetCandidate } from './dataset';
import { PaperTrader, PaperTraderOptions } from './paperTrader';
import { createStrategy } from './strategies';
import { Strategy } from './strategy';
import { Trade } from './Trade';
import { MetricsHelper } from './metricsHelper';

export interface SingleBacktestConfig {
  dataset: DatasetConfig;
  strategy: {
    name: string;
    config: Record<string, number>;
  };
  trader: PaperTraderOptions;
}

export type StrategyIndicator = Record<string, [number, Array<[number, number]>]>;

export interface BacktestReport {
  config: SingleBacktestConfig;
  startBalance: number;
  endBalance: number;
  profit: number;
  trades: Trade[];
  indicators: StrategyIndicator;
  metrics: BacktestMetrics;
}

export interface BacktestMetrics {
  totalTrades: number;
  avgTrades: number;
  totalProfit: number;
  cagr: number;
  sortino: number;
  sharpe: number;
  calmar: number;
  minBalance: number;
  minBalanceTs: number;
  maxBalance: number;
  maxBalanceTs: number;
  drawdown: number;
  drawdownHigh: number;
  drawdownLow: number;
  drawdownStartTs: number;
  drawdownEndTs: number;
  marketChange: number;
}

export class SingleBacktester {
  constructor(
    private readonly config: SingleBacktestConfig,
  ) {
    this.$metrics = {
      totalTrades: 0,
      avgTrades: 0,
      totalProfit: 0,
      cagr: 0,
      sortino: 0,
      sharpe: 0,
      calmar: 0,
      minBalance: Number.MAX_VALUE,
      minBalanceTs: 0,
      maxBalance: 0,
      maxBalanceTs: 0,
      drawdown: 0,
      drawdownHigh: 0,
      drawdownLow: 0,
      drawdownStartTs: 0,
      drawdownEndTs: 0,
      marketChange: 0,
    }
  }

  $candles: AsyncGenerator<Candle> | null = null;
  $strategy: Strategy<Record<string, number>> | null = null;
  $trader: PaperTrader | null = null;

  $trades: Trade[] = [];
  $metrics: BacktestMetrics;
  $indicators: StrategyIndicator = {};

  $firstCandle: Candle | null = null;
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

    this.$strategy = createStrategy(this.config.strategy.name, this.config.strategy.config);
    if (!this.$strategy) {
      return false;
    }

    this.$trader = new PaperTrader(this.config.trader);

    return true;
  }

  public async run() {
    if (!this.$candles || !this.$strategy || !this.$trader) {
      return false;
    }

    for await (const candle of this.$candles) {
      if (!this.$firstCandle) {
        this.$firstCandle = candle;
      }

      const direction = await this.$strategy.update(candle);
      const indicators = await this.$strategy.debug(candle);
      for (const indicator of indicators) {
        if (!this.$indicators[indicator.name]) {
          this.$indicators[indicator.name] = [indicator.index, []];
        }
        this.$indicators[indicator.name][1].push([candle.ts.getTime(), indicator.value]);
      }

      if (direction) {
        const trade = await this.$trader.handleAdvice(candle, direction);

        if (trade) {
          if (this.$trades.length > 0) {
            const lastTrade = this.$trades[this.$trades.length - 1];

            if (lastTrade.action === 'long' || lastTrade.action === 'short') {
              const currBalance = trade.asset * candle.close + trade.currency;
              const prevBalance = lastTrade.asset * lastTrade.price + lastTrade.currency;

              const profit = (currBalance - prevBalance) / prevBalance;

              lastTrade.profit = profit;
              this.$trades[this.$trades.length - 1] = lastTrade;
            }
          }

          this.$trades.push(trade);
        }

        this.processMetrics(candle, trade);
      } else {
        this.processMetrics(candle, null);
      }

      this.$lastCandle = candle;
    }

    return true;
  }

  processMetrics(candle: Candle, trade: Trade | null) {
    if (!this.$trader || !this.$firstCandle || !this.$lastCandle) {
      return;
    }

    const portfolio = this.$trader.$portfolio;
    const balance = portfolio.currency + portfolio.asset * candle.close;

    this.$metrics.totalTrades += trade ? 1 : 0;

    if (balance < this.$metrics.minBalance) {
      this.$metrics.minBalance = balance;
      this.$metrics.minBalanceTs = candle.ts.getTime();
    }
    if (balance > this.$metrics.maxBalance) {
      this.$metrics.maxBalance = balance;
      this.$metrics.maxBalanceTs = candle.ts.getTime();
    }
    this.$metrics.marketChange = (this.$lastCandle.close - this.$firstCandle.close) / this.$firstCandle.close;

    const startBalance = this.config.trader.initialBalance;
    const profit = (balance - startBalance) / startBalance;
    this.$metrics.totalProfit = profit;

    const drawdown = (balance - this.$metrics.maxBalance) / this.$metrics.maxBalance;
    if (drawdown < this.$metrics.drawdown) {
      this.$metrics.drawdown = drawdown;
      this.$metrics.drawdownHigh = this.$metrics.maxBalance;
      this.$metrics.drawdownLow = balance;
      this.$metrics.drawdownStartTs = this.$metrics.maxBalanceTs;
      this.$metrics.drawdownEndTs = candle.ts.getTime();
    }

    const metrics = new MetricsHelper(this.config, portfolio, this.$metrics, this.$firstCandle, this.$lastCandle);
    this.$metrics.cagr = metrics.cagr();
    this.$metrics.avgTrades = metrics.avgTrades();
    this.$metrics.sortino = metrics.sortino(this.$trades);
    this.$metrics.sharpe = metrics.sharpes(this.$trades);
    this.$metrics.calmar = metrics.calmar();
  }

  public report(): BacktestReport | null {
    if (!this.$trader || !this.$lastCandle) {
      return null;
    }

    const portfolio = this.$trader.$portfolio;

    const startBalance = this.config.trader.initialBalance;
    const endBalance = portfolio.currency + portfolio.asset * this.$lastCandle.close;
    const profit = (endBalance - startBalance) / startBalance;

    return {
      config: this.config,
      startBalance,
      endBalance,
      profit,
      trades: this.$trades,
      metrics: this.$metrics,
      indicators: this.$indicators,
    };
  }
}
