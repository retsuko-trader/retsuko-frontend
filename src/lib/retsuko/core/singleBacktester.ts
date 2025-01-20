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

export interface BacktestReport {
  config: SingleBacktestConfig;
  startBalance: number;
  endBalance: number;
  profit: number;
  trades: Trade[];
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
  profitFactor: number;
  minBalance: number;
  maxBalance: number;
  maxAccountDrawdown: number;
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
      profitFactor: 0,
      minBalance: Number.MAX_VALUE,
      maxBalance: 0,
      maxAccountDrawdown: 0,
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

    this.$metrics.minBalance = Math.min(this.$metrics.minBalance, balance);
    this.$metrics.maxBalance = Math.max(this.$metrics.maxBalance, balance);

    const startBalance = this.config.trader.initialBalance;
    const profit = (balance - startBalance) / startBalance;
    this.$metrics.totalProfit = profit;

    const drawdown = (balance - this.$metrics.maxBalance) / this.$metrics.maxBalance;
    if (drawdown < this.$metrics.maxAccountDrawdown) {
      this.$metrics.maxAccountDrawdown = drawdown;
      this.$metrics.drawdownHigh = this.$metrics.maxBalance;
      this.$metrics.drawdownLow = balance;
      this.$metrics.drawdownStartTs = this.$lastCandle.ts.getTime();
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
    };
  }
}
